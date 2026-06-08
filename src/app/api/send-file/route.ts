import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const caption = (formData.get("caption") as string) || "";

        if (!file) {
            return NextResponse.json({ error: "No file" }, { status: 400 });
        }

        const tgForm = new FormData();
        tgForm.append("chat_id", CHANNEL_ID);
        tgForm.append("caption", caption);
        tgForm.append("document", file, file.name);

        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            method: "POST",
            body: tgForm,
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`[send-file] Telegram error: ${res.status} ${body}`);
            return NextResponse.json({ ok: false, error: body }, { status: 502 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[send-file] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
