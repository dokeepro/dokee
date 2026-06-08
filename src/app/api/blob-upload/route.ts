import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "No file" }, { status: 400 });
        }

        const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

        const blob = await put(safeName, file, {
            access: "public",
            addRandomSuffix: false,
            token: process.env.BLOB_PUBLIC_READ_WRITE_TOKEN,
        });

        return NextResponse.json({ url: blob.url });
    } catch (err) {
        console.error("[blob-upload] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
