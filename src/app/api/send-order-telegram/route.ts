import { NextRequest, NextResponse } from "next/server";

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

type FileReport = {
    name: string;
    url: string;
    step: string;
    ok: boolean;
    info?: string;
};

export async function POST(req: NextRequest) {
    const report: { textOk: boolean; filesReceived: number; files: FileReport[]; error?: string } = {
        textOk: false,
        filesReceived: 0,
        files: [],
    };

    if (!BOT_TOKEN || !CHANNEL_ID) {
        return NextResponse.json({ ...report, error: "Telegram not configured" }, { status: 500 });
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

        report.filesReceived = files.length;

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

        const textRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: message.trim(),
                parse_mode: "HTML",
                disable_web_page_preview: true,
            }),
        });
        report.textOk = textRes.ok;

        console.log(`[TG] Order ${orderReference}: ${files.length} file(s) received`);

        for (const file of files) {
            const fileReport: FileReport = { name: file.name, url: file.url, step: "start", ok: false };
            report.files.push(fileReport);
            try {
                if (!file.url) {
                    fileReport.step = "no-url";
                    fileReport.info = "file.url is empty";
                    continue;
                }

                // Fetch private blob directly with Authorization header.
                fileReport.step = "fetch-blob";
                const fileRes = await fetch(file.url, {
                    headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
                    redirect: "follow",
                });
                if (!fileRes.ok) {
                    fileReport.info = `blob fetch ${fileRes.status} ${(await fileRes.text()).slice(0, 200)}`;
                    continue;
                }

                fileReport.step = "read-bytes";
                const arrayBuffer = await fileRes.arrayBuffer();
                fileReport.info = `${arrayBuffer.byteLength} bytes`;
                console.log(`[TG] Fetched ${file.name}: ${arrayBuffer.byteLength} bytes`);

                if (arrayBuffer.byteLength < 50) {
                    fileReport.step = "too-small";
                    continue;
                }

                const contentType = file.type || fileRes.headers.get("content-type") || "application/octet-stream";
                const fileBlob = new Blob([arrayBuffer], { type: contentType });

                fileReport.step = "send-telegram";
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
                    fileReport.info = `telegram ${tgRes.status} ${tgBody.slice(0, 300)}`;
                    console.error(`[TG] sendDocument failed for ${file.name}: ${tgRes.status} ${tgBody}`);
                } else {
                    fileReport.ok = true;
                    fileReport.step = "done";
                    console.log(`[TG] Sent ${file.name} OK`);
                }
            } catch (fileErr) {
                fileReport.info = `exception: ${(fileErr as Error).message}`;
                console.error(`[TG] Error processing file ${file.name}:`, fileErr);
            }
        }

        return NextResponse.json(report);
    } catch (err) {
        report.error = (err as Error).message;
        console.error("Telegram send error:", err);
        return NextResponse.json(report, { status: 500 });
    }
}
