import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
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

export async function POST(req: NextRequest) {
    try {
        const { orderReference } = await req.json();
        if (!orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        const { blobs } = await list({
            prefix: `orders/${orderReference}.json`,
            token: BLOB_TOKEN,
        });

        if (blobs.length === 0) {
            return NextResponse.json({ ok: true, alreadyProcessed: true });
        }

        const metaRes = await fetch(blobs[0].url, {
            headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
        });
        if (!metaRes.ok) {
            return NextResponse.json({ error: "Failed to read order" }, { status: 500 });
        }

        const order: OrderData = await metaRes.json();

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

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: message.trim(),
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });

        for (const file of order.files) {
            if (!file.url) continue;
            try {
                const fileRes = await fetch(file.url, {
                    headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
                    redirect: "follow",
                });
                if (!fileRes.ok) continue;
                const buf = await fileRes.arrayBuffer();
                if (buf.byteLength < 50) continue;

                const blob = new Blob([buf], { type: file.type || "application/octet-stream" });
                const tgForm = new FormData();
                tgForm.append("chat_id", CHANNEL_ID);
                tgForm.append("caption", file.name);
                tgForm.append("document", blob, file.name);

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: "POST",
                    body: tgForm,
                });
            } catch (fileErr) {
                console.error(`[complete-order] file ${file.name} error:`, fileErr);
            }
        }

        const blobsToDelete = [blobs[0].url, ...order.files.map((f) => f.url).filter(Boolean)];
        await del(blobsToDelete, { token: BLOB_TOKEN }).catch((err) =>
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
