import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const metadataRaw = formData.get("metadata");
        if (!metadataRaw || typeof metadataRaw !== "string") {
            return NextResponse.json({ error: "metadata required" }, { status: 400 });
        }

        const order = JSON.parse(metadataRaw);

        let message = `<b>⏳ Нове замовлення (очікує оплати)</b>\n\n`;
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

        for (const [key, value] of formData.entries()) {
            if (key.startsWith("file_") && value instanceof Blob) {
                const file = value as File;
                const tgForm = new FormData();
                tgForm.append("chat_id", CHANNEL_ID);
                tgForm.append("caption", `📎 ${order.orderReference} — ${file.name}`);
                tgForm.append("document", file, file.name);

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: "POST",
                    body: tgForm,
                });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[save-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
