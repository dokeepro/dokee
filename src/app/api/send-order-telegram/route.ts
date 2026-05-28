import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

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

        for (const file of files) {
            try {
                const fileRes = await fetch(file.url, { redirect: "follow" });
                if (!fileRes.ok) {
                    console.error(`Failed to fetch blob: ${file.url} — ${fileRes.status}`);
                    continue;
                }
                const fileBlob = await fileRes.blob();
                if (fileBlob.size < 100) {
                    console.error(`Blob too small (${fileBlob.size}B), skipping: ${file.url}`);
                    continue;
                }

                const tgForm = new FormData();
                tgForm.append("chat_id", CHANNEL_ID);
                tgForm.append("caption", file.name);
                tgForm.append("document", fileBlob, file.name);

                const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: "POST",
                    body: tgForm,
                });
                if (!tgRes.ok) {
                    const errBody = await tgRes.text();
                    console.error(`Telegram sendDocument failed: ${tgRes.status} ${errBody}`);
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
