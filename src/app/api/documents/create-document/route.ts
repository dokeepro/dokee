import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import DocumentModel, { type LanguageTariffDoc } from "@/models/Document";
import { uploadImage } from "@/lib/uploadImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const form = await req.formData();

        const name = form.get("name") as string;
        const documentCountry = form.get("documentCountry") as string;

        let parsedLanguageTariffs: LanguageTariffDoc[] = [];
        const rawTariffs = form.get("languageTariffs");
        if (typeof rawTariffs === "string") {
            try {
                parsedLanguageTariffs = JSON.parse(rawTariffs);
            } catch (e) {
                console.error("Failed to parse languageTariffs:", e);
            }
        }

        const lastDoc = await DocumentModel.findOne().sort({ order: -1 });
        const order = lastDoc ? lastDoc.order + 1 : 1;

        // Collect sample images uploaded as samples[idx][image] with matching
        // samples[idx][title] text fields.
        const samples: { title: string; imageUrl: string }[] = [];
        for (const [key, value] of form.entries()) {
            const match = key.match(/^samples\[(\d+)\]\[image\]$/);
            if (match && value instanceof File) {
                const idx = Number(match[1]);
                const title = (form.get(`samples[${idx}][title]`) as string) || `Sample ${idx + 1}`;
                const ext = value.name ? value.name.substring(value.name.lastIndexOf(".")) : "";
                const fileName = `document-dokee-image-${order}-${idx + 1}${ext}`;
                const buffer = Buffer.from(await value.arrayBuffer());
                const imageUrl = await uploadImage(buffer, fileName, value.type);
                samples.push({ title, imageUrl });
            }
        }

        const samplesWithTariffs = samples.map((sample) => ({
            ...sample,
            languageTariffs: parsedLanguageTariffs || [],
        }));

        const doc = await DocumentModel.create({
            name,
            order,
            documentCountry,
            languageTariffs: parsedLanguageTariffs,
            samples: samplesWithTariffs,
        });

        return NextResponse.json(doc, { status: 201 });
    } catch (err) {
        console.error("create-document error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
