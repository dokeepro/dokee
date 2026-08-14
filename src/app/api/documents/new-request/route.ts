import { NextRequest, NextResponse } from "next/server";
import { sendEmail, type MailAttachment } from "@/lib/sendEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();

        const attachments: MailAttachment[] = [];
        for (const value of form.getAll("files")) {
            if (value instanceof File) {
                const ext = value.name?.split(".").pop() || "pdf";
                const randomId = Math.floor(100000 + Math.random() * 900000);
                attachments.push({
                    filename: `offer-document-${randomId}.${ext}`,
                    content: Buffer.from(await value.arrayBuffer()),
                });
            }
        }

        const html = `<h2>Предложение на перевод документа</h2>
                      <p>Документ прикреплённый ниже</p>`;

        await sendEmail(
            "dokee.pro@gmail.com",
            "Предложение на перевод документа",
            "",
            attachments.length ? attachments : [],
            html,
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("new-request error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
