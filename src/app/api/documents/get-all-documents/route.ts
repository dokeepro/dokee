import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import DocumentModel from "@/models/Document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        const documents = await DocumentModel.find().sort({ order: 1 }).lean();
        return NextResponse.json(documents, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (err) {
        console.error("get-all-documents error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
