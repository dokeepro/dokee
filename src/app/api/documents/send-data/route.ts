import { NextRequest, NextResponse, after } from "next/server";
import { sendOrderData, type SendDataInput, type SendDataSample } from "@/lib/sendData";
import { type MailAttachment } from "@/lib/sendEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let payload: SendDataInput;

        if (contentType.includes("multipart/form-data")) {
            const form = await req.formData();
            const rawSamples = form.get("samples");
            const samples: SendDataSample[] =
                typeof rawSamples === "string" ? JSON.parse(rawSamples) : [];

            const files: MailAttachment[] = [];
            for (const value of form.getAll("files")) {
                if (value instanceof File) {
                    const ext = value.name?.split(".").pop() || "pdf";
                    const randomId = Math.floor(100000 + Math.random() * 900000);
                    files.push({
                        filename: `dokee-${randomId}.${ext}`,
                        content: Buffer.from(await value.arrayBuffer()),
                    });
                }
            }

            payload = {
                email: (form.get("email") as string) || "dokee.pro@gmail.com",
                languagePair: form.get("languagePair") as string,
                tariff: form.get("tariff") as string,
                totalValue: (form.get("totalValue") as string) ?? undefined,
                selectedDate: (form.get("selectedDate") as string) ?? undefined,
                samples,
                files,
            };
        } else {
            const body = await req.json();
            payload = {
                email: body.email || "dokee.pro@gmail.com",
                languagePair: body.languagePair,
                tariff: body.tariff,
                totalValue: body.totalValue,
                selectedDate: body.selectedDate,
                samples: body.samples || [],
            };
        }

        // Respond immediately; the payment gateway and client must not wait for email.
        after(async () => {
            try {
                await sendOrderData(payload);
            } catch (err) {
                console.error("send-data background error:", err);
            }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("send-data error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
