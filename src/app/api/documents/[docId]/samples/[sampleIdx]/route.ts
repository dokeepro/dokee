import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import DocumentModel, { type LanguageTariffDoc } from "@/models/Document";
import { uploadImage } from "@/lib/uploadImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ docId: string; sampleIdx: string }> },
) {
    try {
        await dbConnect();
        const { docId, sampleIdx } = await params;

        const doc = await DocumentModel.findById(docId);
        if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        const sampleIndex = parseInt(sampleIdx, 10);
        if (isNaN(sampleIndex) || sampleIndex < 0 || sampleIndex >= doc.samples.length) {
            return NextResponse.json({ error: "Invalid sample index" }, { status: 400 });
        }

        const sample = doc.samples[sampleIndex];
        const form = await req.formData();

        const title = form.get("title");
        if (title !== null) sample.title = title as string;

        const rawTariffs = form.get("languageTariffs");
        if (rawTariffs !== null) {
            sample.languageTariffs =
                typeof rawTariffs === "string"
                    ? (JSON.parse(rawTariffs) as LanguageTariffDoc[])
                    : (rawTariffs as unknown as LanguageTariffDoc[]);
        }

        const image = form.get("image");
        if (image instanceof File) {
            const ext = image.name ? image.name.split(".").pop() : "jpg";
            const fileName = `document-sample-${docId}-${sampleIndex}.${ext}`;
            const buffer = Buffer.from(await image.arrayBuffer());
            sample.imageUrl = await uploadImage(buffer, fileName, image.type);
        }

        if (form.get("removeImage") === "true") {
            sample.imageUrl = "";
        }

        await doc.save();
        return NextResponse.json(sample);
    } catch (err) {
        console.error("updateSample error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ docId: string; sampleIdx: string }> },
) {
    try {
        await dbConnect();
        const { docId, sampleIdx } = await params;

        const doc = await DocumentModel.findById(docId);
        if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        const sampleIndex = parseInt(sampleIdx, 10);
        if (isNaN(sampleIndex) || sampleIndex < 0 || sampleIndex >= doc.samples.length) {
            return NextResponse.json({ error: "Invalid sample index" }, { status: 400 });
        }

        doc.samples.splice(sampleIndex, 1);
        await doc.save();
        return NextResponse.json({ success: true, samples: doc.samples });
    } catch (err) {
        console.error("deleteSample error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
