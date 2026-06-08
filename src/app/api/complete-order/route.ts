import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;
const BLOB_TOKEN = process.env.BLOB_PUBLIC_READ_WRITE_TOKEN!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const maxDuration = 120;

type FileEntry = { name: string; type: string; url: string };

type OrderData = {
    orderReference: string;
    languagePair: string;
    tariff: string;
    totalValue: number;
    selectedDate?: string;
    samples: {
        docName?: string;
        sampleTitle?: string;
        fioLatin?: string;
        sealText?: string;
        stampText?: string;
        computedPrice?: number;
    }[];
    files: FileEntry[];
};

async function findOrder(orderReference: string): Promise<string | null> {
    for (let attempt = 0; attempt < 5; attempt++) {
        const { blobs } = await list({
            prefix: `orders/${orderReference}.json`,
            token: BLOB_TOKEN,
        });
        if (blobs.length) return blobs[0].url;
        await new Promise((r) => setTimeout(r, 2000));
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const { orderReference } = await req.json();
        if (!orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        console.log(`[complete-order] starting for ${orderReference}`);

        const orderUrl = await findOrder(orderReference);
        if (!orderUrl) {
            console.log(`[complete-order] ${orderReference}: not found after retries (already processed or not saved yet)`);
            return NextResponse.json({ ok: true, alreadyProcessed: true });
        }

        const metaRes = await fetch(orderUrl);
        if (!metaRes.ok) {
            console.error(`[complete-order] failed to fetch order JSON: ${metaRes.status}`);
            return NextResponse.json({ error: "Failed to read order" }, { status: 500 });
        }

        const order: OrderData = await metaRes.json();

        let message = `<b>✅ Нова заявка на переклад (оплачено)</b>\n\n`;
        message += `<b>Замовлення №:</b> ${order.orderReference}\n`;
        message += `<b>Мовна пара:</b> ${order.languagePair}\n`;
        message += `<b>Тариф:</b> ${order.tariff}\n`;
        message += `<b>Загальна вартість:</b> ${order.totalValue} ₸\n`;

        for (const s of order.samples) {
            message += `\n<b>${s.docName || "Документ"}</b>\n`;
            message += `Назва: ${s.sampleTitle || "-"}\n`;
            message += `Вартість: ${s.computedPrice ?? "-"} ₸\n`;
            message += `ФІО латиницею: ${s.fioLatin || "-"}\n`;
            message += `Печатка: ${s.sealText || "-"}\n`;
            message += `Штамп: ${s.stampText || "-"}\n`;
        }

        if (order.selectedDate) {
            message += `\n<b>Обрана дата:</b> ${order.selectedDate}\n`;
        }

        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: message.trim(),
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });
        console.log(`[complete-order] TG message sent: ${tgRes.status}`);

        for (const file of order.files) {
            if (!file.url) continue;
            try {
                const fileRes = await fetch(file.url);
                if (!fileRes.ok) {
                    console.error(`[complete-order] file download failed: ${file.name} ${fileRes.status}`);
                    continue;
                }
                const buf = await fileRes.arrayBuffer();
                if (buf.byteLength < 50) continue;

                const blob = new Blob([buf], { type: file.type || "application/octet-stream" });
                const tgForm = new FormData();
                tgForm.append("chat_id", CHANNEL_ID);
                tgForm.append("caption", `📎 ${order.orderReference} — ${file.name}`);
                tgForm.append("document", blob, file.name);

                const docRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: "POST",
                    body: tgForm,
                });
                console.log(`[complete-order] TG file ${file.name}: ${docRes.status}`);
            } catch (fileErr) {
                console.error(`[complete-order] file ${file.name} error:`, fileErr);
            }
        }

        const urlsToDelete = [orderUrl, ...order.files.map((f) => f.url).filter(Boolean)];
        await del(urlsToDelete, { token: BLOB_TOKEN }).catch((err) =>
            console.error("[complete-order] cleanup error:", err),
        );

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
        }).catch((err) => console.error("[complete-order] email error:", err));

        console.log(`[complete-order] ${orderReference}: done, ${order.files.length} files`);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[complete-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
