import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderReference } = body;
        if (!orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        await put(`orders/${orderReference}.json`, JSON.stringify(body), {
            access: "public",
            addRandomSuffix: false,
            contentType: "application/json",
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[save-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
