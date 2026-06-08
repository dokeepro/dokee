import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    if (!BOT_TOKEN || !CHANNEL_ID) {
        return NextResponse.json({ error: "Telegram not configured" }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const caption = (formData.get("caption") as string) || "file";

        if (!file) {
            return NextResponse.json({ error: "No file" }, { status: 400 });
        }

        const tgForm = new FormData();
        tgForm.append("chat_id", CHANNEL_ID);
        tgForm.append("caption", caption);
        tgForm.append("document", file, caption);

        const tgRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
            { method: "POST", body: tgForm },
        );

        if (!tgRes.ok) {
            const body = await tgRes.text();
            console.error(`[send-telegram-file] failed: ${tgRes.status} ${body}`);
            return NextResponse.json({ ok: false, error: body }, { status: 502 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[send-telegram-file] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
