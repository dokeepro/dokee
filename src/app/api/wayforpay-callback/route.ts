import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET_KEY = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY!;

const generateSignature = (data: Record<string, string>): string => {
    const fields = [
        'merchantAccount',
        'orderReference',
        'amount',
        'currency',
        'authCode',
        'cardPan',
        'transactionStatus',
        'reasonCode'
    ];

    const signatureString = fields.map((key) => data[key]).join(';');
    return crypto
        .createHmac("md5", SECRET_KEY)
        .update(signatureString)
        .digest("hex");
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const expectedSignature = generateSignature(body);
        const receivedSignature = body.merchantSignature;

        if (expectedSignature !== receivedSignature) {
            return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
        }

        if (body.transactionStatus === "Approved") {
            const orderRef = body.orderReference;

            console.log("✅ Payment approved for order:", orderRef);

            return NextResponse.json({
                orderReference: body.orderReference,
                status: "accept",
                time: Date.now(),
            });
        } else {
            console.log("❌ Payment declined or failed:", body.transactionStatus);
            return NextResponse.json({ success: false, status: body.transactionStatus });
        }
    } catch (e) {
        console.error("❌ Callback error:", e);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
