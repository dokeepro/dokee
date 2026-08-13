import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import DocumentModel from "@/models/Document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ docId: string }> },
) {
    try {
        await dbConnect();
        const { docId } = await params;

        const deleted = await DocumentModel.findByIdAndDelete(docId);
        if (!deleted) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("deleteDocument error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
