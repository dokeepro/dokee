import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import DocumentModel, { type LanguageTariffDoc } from "@/models/Document";
import { uploadImage } from "@/lib/uploadImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ docId: string }> },
) {
    try {
        await dbConnect();
        const { docId } = await params;

        const doc = await DocumentModel.findById(docId);
        if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        const form = await req.formData();
        const title = form.get("title") as string;

        let languageTariffs: LanguageTariffDoc[] | null = null;
        const rawTariffs = form.get("languageTariffs");
        if (typeof rawTariffs === "string") {
            try {
                languageTariffs = JSON.parse(rawTariffs);
            } catch {
                languageTariffs = null;
            }
        }

        // A new sample inherits the document's tariffs by default so it is
        // immediately orderable with correct prices.
        const tariffs =
            Array.isArray(languageTariffs) && languageTariffs.length
                ? languageTariffs
                : doc.languageTariffs || [];

        let imageUrl = "";
        const image = form.get("image");
        if (image instanceof File) {
            const ext = image.name ? image.name.split(".").pop() : "jpg";
            const fileName = `document-sample-${docId}-${Date.now()}.${ext}`;
            const buffer = Buffer.from(await image.arrayBuffer());
            imageUrl = await uploadImage(buffer, fileName, image.type);
        }

        doc.samples.push({
            title: title || `Образец ${doc.samples.length + 1}`,
            imageUrl,
            languageTariffs: tariffs,
        });

        await doc.save();
        return NextResponse.json(doc.samples[doc.samples.length - 1], { status: 201 });
    } catch (err) {
        console.error("addSample error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
