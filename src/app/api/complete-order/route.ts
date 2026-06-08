import { NextRequest, NextResponse } from "next/server";
import { completeOrder } from "@/lib/completeOrder";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const { orderReference } = await req.json();
        if (!orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        const result = await completeOrder(orderReference);
        return NextResponse.json(result);
    } catch (err) {
        console.error("[complete-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
