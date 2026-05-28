import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export const maxDuration = 60;

type SamplePayload = {
    docName?: string;
    sampleTitle?: string;
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
    computedPrice?: number;
};

type FileEntry = {
    name: string;
    type: string;
    url: string;
};

type OrderPayload = {
    orderReference: string;
    languagePair: string;
    tariff: string;
    totalValue: string | number;
    selectedDate?: string;
    samples: SamplePayload[];
    files: FileEntry[];
};

export async function POST(req: NextRequest) {
    if (!BOT_TOKEN || !CHANNEL_ID) {
        return NextResponse.json({ error: "Telegram not configured" }, { status: 500 });
    }

    try {
        const body: OrderPayload = await req.json();

        const {
            orderReference = "-",
            languagePair = "-",
            tariff = "-",
            totalValue = "0",
            selectedDate,
            samples = [],
            files = [],
        } = body;

        let message = `<b>Нова заявка на переклад</b>\n\n`;
        message += `<b>Замовлення №:</b> ${orderReference}\n`;
        message += `<b>Мовна пара:</b> ${languagePair}\n`;
        message += `<b>Тариф:</b> ${tariff}\n`;
        message += `<b>Загальна вартість:</b> ${totalValue} ₸\n`;

        for (const s of samples) {
            message += `\n<b>${s.docName || "Документ"}</b>\n`;
            message += `Назва: ${s.sampleTitle || "-"}\n`;
            message += `Мовна пара: ${languagePair}\n`;
            message += `Тариф: ${tariff}\n`;
            message += `Вартість: ${s.computedPrice ?? "-"} ₸\n`;
            message += `ФІО латиницею: ${s.fioLatin || "-"}\n`;
            message += `Печатка: ${s.sealText || "-"}\n`;
            message += `Штамп: ${s.stampText || "-"}\n`;
        }

        if (selectedDate) {
            message += `\n<b>Обрана дата:</b> ${selectedDate}\n`;
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

        console.log(`[TG] Order ${orderReference}: ${files.length} file(s)`, JSON.stringify(files.map(f => ({ name: f.name, type: f.type, url: f.url?.slice(0, 80) }))));

        for (const file of files) {
            try {
                if (!file.url) {
                    console.error(`[TG] Skipping file with no URL: ${file.name}`);
                    continue;
                }
                console.log(`[TG] Fetching private blob: ${file.name} (${file.type}) from ${file.url}`);

                const blobRes = await get(file.url, {
                    access: 'private',
                    token: BLOB_TOKEN,
                });
                if (!blobRes || blobRes.statusCode !== 200) {
                    console.error(`[TG] get() failed for ${file.url}, statusCode:`, blobRes?.statusCode);
                    continue;
                }

                const reader = blobRes.stream.getReader();
                const chunks: Uint8Array[] = [];
                let total = 0;
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    total += value.length;
                }
                const arrayBuffer = new Uint8Array(total);
                let offset = 0;
                for (const chunk of chunks) {
                    arrayBuffer.set(chunk, offset);
                    offset += chunk.length;
                }
                console.log(`[TG] Fetched ${file.name}: ${total} bytes (contentType: ${blobRes.blob.contentType})`);

                if (total < 50) {
                    console.error(`[TG] Blob too small (${total}B), skipping: ${file.url}`);
                    continue;
                }

                const contentType = file.type || blobRes.blob.contentType || "application/octet-stream";
                const fileBlob = new Blob([arrayBuffer], { type: contentType });

                const tgForm = new FormData();
                tgForm.append("chat_id", CHANNEL_ID);
                tgForm.append("caption", file.name);
                tgForm.append("document", fileBlob, file.name);

                const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: "POST",
                    body: tgForm,
                });
                const tgBody = await tgRes.text();
                if (!tgRes.ok) {
                    console.error(`Telegram sendDocument failed for ${file.name}: ${tgRes.status} ${tgBody}`);
                } else {
                    console.log(`Sent ${file.name} to Telegram OK`);
                }
            } catch (fileErr) {
                console.error(`Error processing file ${file.name}:`, fileErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Telegram send error:", err);
        return NextResponse.json({ error: "Failed to send to Telegram" }, { status: 500 });
    }
}
