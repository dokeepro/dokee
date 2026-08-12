import { NextRequest, NextResponse } from "next/server";
import { loadOrderFromBlob, completeOrder, type OrderData } from "@/lib/completeOrder";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const orderReference: string | undefined = body?.orderReference;
        if (!orderReference) {
            return NextResponse.json({ error: "orderReference required" }, { status: 400 });
        }

        // Always resolve the authoritative order from Blob by its reference.
        // Never trust the order payload the client posted: on the device that
        // created the payment link, localStorage may hold a DIFFERENT (older)
        // order, which previously caused the wrong order to be delivered.
        const order = await loadOrderFromBlob(orderReference);
        if (!order) {
            // No blob means the webhook already completed and cleaned it up,
            // or the order was never saved. Either way, nothing to send.
            console.log(`[complete-order] ${orderReference}: no blob, already processed or missing`);
            return NextResponse.json({ ok: true, alreadyProcessed: true });
        }

        const result = await completeOrder(order as OrderData);
        return NextResponse.json(result);
    } catch (err) {
        console.error("[complete-order] error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
