import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const maxDuration = 120;

type SamplePayload = {
    docName?: string;
    sampleTitle?: string;
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
    computedPrice?: number;
};

type FileEntry = { name: string; type: string; url: string };

type OrderData = {
    orderReference: string;
    languagePair: string;
    tariff: string;
    totalValue: number;
    selectedDate?: string;
    samples: SamplePayload[];
    files: FileEntry[];
};

async function sendTelegramText(order: OrderData): Promise<boolean> {
    let message = `<b>Нова заявка на переклад</b>\n\n`;
    message += `<b>Замовлення №:</b> ${order.orderReference}\n`;
    message += `<b>Мовна пара:</b> ${order.languagePair}\n`;
    message += `<b>Тариф:</b> ${order.tariff}\n`;
    message += `<b>Загальна вартість:</b> ${order.totalValue} ₸\n`;

    for (const s of order.samples) {
        message += `\n<b>${s.docName || "Документ"}</b>\n`;
        message += `Назва: ${s.sampleTitle || "-"}\n`;
        message += `Мовна пара: ${order.languagePair}\n`;
        message += `Тариф: ${order.tariff}\n`;
        message += `Вартість: ${s.computedPrice ?? "-"} ₸\n`;
        message += `ФІО латиницею: ${s.fioLatin || "-"}\n`;
        message += `Печатка: ${s.sealText || "-"}\n`;
        message += `Штамп: ${s.stampText || "-"}\n`;
    }

    if (order.selectedDate) {
        message += `\n<b>Обрана дата:</b> ${order.selectedDate}\n`;
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHANNEL_ID,
            text: message.trim(),
            parse_mode: "HTML",
            disable_web_page_preview: true,
        }),
    });
    return res.ok;
}

async function sendTelegramFile(file: FileEntry): Promise<boolean> {
    if (!file.url) return false;

    const fileRes = await fetch(file.url, {
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
        redirect: "follow",
    });
    if (!fileRes.ok) {
        console.error(`[complete-order] blob fetch failed for ${file.name}: ${fileRes.status}`);
        return false;
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    if (arrayBuffer.byteLength < 50) return false;

    const contentType = file.type || fileRes.headers.get("content-type") || "application/octet-stream";
    const blob = new Blob([arrayBuffer], { type: contentType });

    const form = new FormData();
    form.append("chat_id", CHANNEL_ID);
    form.append("caption", file.name);
    form.append("document", blob, file.name);

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: form,
    });

    if (!tgRes.ok) {
        const body = await tgRes.text();
        console.error(`[complete-order] sendDocument failed for ${file.name}: ${tgRes.status} ${body}`);
    }
    return tgRes.ok;
}

async function deleteBlobs(files: FileEntry[]) {
    const urls = files.map(f => f.url).filter(Boolean);
    if (urls.length === 0) return;
    try {
        await del(urls, { token: BLOB_TOKEN });
    } catch (err) {
        console.error("[complete-order] blob cleanup error:", err);
    }
}

async function triggerEmailAndSlots(order: OrderData) {
    try {
        await fetch(`${BACKEND_URL}/documents/send-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "dokee.pro@gmail.com",
                orderReference: order.orderReference,
                languagePair: order.languagePair,
                tariff: order.tariff,
                samples: order.samples,
                totalValue: order.totalValue,
                selectedDate: order.selectedDate,
            }),
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        console.error("[complete-order] email/slots trigger error:", err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { orderReference } = await req.json();
        if (!orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        const claimRes = await fetch(`${BACKEND_URL}/documents/pending-order/${encodeURIComponent(orderReference)}/claim`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
        });

        const claimData = await claimRes.json();

        if (claimData.alreadyProcessed) {
            return NextResponse.json({ success: true, alreadyProcessed: true });
        }

        if (!claimRes.ok || !claimData.order) {
            return NextResponse.json({ error: "Order not found or already processed" }, { status: 404 });
        }

        const order: OrderData = claimData.order;

        const textOk = await sendTelegramText(order);

        let filesSent = 0;
        for (const file of order.files) {
            const ok = await sendTelegramFile(file);
            if (ok) filesSent++;
        }

        console.log(`[complete-order] ${orderReference}: text=${textOk}, files=${filesSent}/${order.files.length}`);

        await deleteBlobs(order.files);

        await triggerEmailAndSlots(order);

        await fetch(`${BACKEND_URL}/documents/pending-order/${encodeURIComponent(orderReference)}/complete`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
        }).catch(err => console.error("[complete-order] mark complete error:", err));

        return NextResponse.json({ success: true, textOk, filesSent });
    } catch (err) {
        console.error("[complete-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
