import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import GeneralModel from "@/models/General";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        let general = await GeneralModel.findOne();
        if (!general) {
            general = new GeneralModel();
        }
        general.set(body);
        await general.save();

        return NextResponse.json(general, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (err) {
        console.error("update-general error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
