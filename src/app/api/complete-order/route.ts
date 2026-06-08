import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { completeOrder } from "@/lib/completeOrder";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const order = await req.json();
        if (!order?.orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        const { blobs } = await list({
            prefix: `orders/${order.orderReference}.json`,
            token: process.env.BLOB_PUBLIC_READ_WRITE_TOKEN,
        }).catch(() => ({ blobs: [] }));

        if (!blobs.length) {
            console.log(`[complete-order] ${order.orderReference}: already processed by webhook`);
            return NextResponse.json({ ok: true, alreadyProcessed: true });
        }

        const result = await completeOrder(order);
        return NextResponse.json(result);
    } catch (err) {
        console.error("[complete-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
