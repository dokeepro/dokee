import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

// This route no longer receives the file bytes. The browser uploads the file
// DIRECTLY to Vercel Blob using a short-lived client token issued here, which
// bypasses the 4.5MB serverless request-body limit (the cause of the
// 413 FUNCTION_PAYLOAD_TOO_LARGE errors). Files up to maximumSizeInBytes are
// accepted.
export async function POST(req: NextRequest): Promise<NextResponse> {
    const body = (await req.json()) as HandleUploadBody;

    try {
        const json = await handleUpload({
            body,
            request: req,
            // Use the same public store the rest of the app reads/writes, so the
            // webhook (complete-order) can find and delete these blobs.
            token: process.env.BLOB_PUBLIC_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async () => ({
                allowedContentTypes: [
                    "image/*",
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                addRandomSuffix: true,
                // Telegram bots can send documents up to 50MB; cap a little below.
                maximumSizeInBytes: 45 * 1024 * 1024,
            }),
            // Nothing to do on completion — the order JSON is saved separately.
            onUploadCompleted: async () => {},
        });

        return NextResponse.json(json);
    } catch (err) {
        console.error("[blob-upload] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
}
