import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET_KEY = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dokee-backend.onrender.com";

const generateSignature = (data: Record<string, string>): string => {
    const fields = [
        "merchantAccount",
        "orderReference",
        "amount",
        "currency",
        "authCode",
        "cardPan",
        "transactionStatus",
        "reasonCode",
    ];

    const signatureString = fields.map((key) => data[key] ?? "").join(";");
    return crypto.createHmac("md5", SECRET_KEY).update(signatureString).digest("hex");
};

export async function POST(req: NextRequest) {
    try {
        const body: Record<string, string> = await req.json();

        const expectedSignature = generateSignature(body);
        const receivedSignature = body.merchantSignature;

        if (expectedSignature !== receivedSignature) {
            return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const orderRef = cookieStore.get("wayforpay_order_ref")?.value;

        if (!orderRef) {
            return NextResponse.json({ success: false, error: "Missing orderReference in cookie" }, { status: 400 });
        }

        const res = await fetch(`${BACKEND_URL}/check-wayforpay-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderReference: orderRef }),
        });

        const data = await res.json();

        if (data.transactionStatus === "Approved") {
            console.log("✅ Status check confirmed payment for:", orderRef);
            return NextResponse.json({
                orderReference: orderRef,
                status: "confirmed",
                time: Date.now(),
            });
        } else {
            console.log("❌ Status check says NOT approved:", data.transactionStatus);
            return NextResponse.json({ success: false, status: data.transactionStatus });
        }
    } catch (e) {
        console.error("❌ Callback error:", e);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
