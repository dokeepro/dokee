import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import GeneralModel from "@/models/General";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        let general = await GeneralModel.findOne();
        if (!general) {
            general = await GeneralModel.create({});
        }
        return NextResponse.json(general, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (err) {
        console.error("get-general-settings error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
