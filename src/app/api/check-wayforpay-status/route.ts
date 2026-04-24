import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET_KEY =
    process.env.WAYFORPAY_MERCHANT_SECRET_KEY ||
    process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY;
const MERCHANT_ACCOUNT = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_ACCOUNT;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const orderReference = searchParams.get("orderRef");

    if (!orderReference || !SECRET_KEY || !MERCHANT_ACCOUNT) {
        return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
    }

    const signature = crypto
        .createHmac("md5", SECRET_KEY)
        .update(`${MERCHANT_ACCOUNT};${orderReference}`)
        .digest("hex");

    try {
        const res = await fetch("https://api.wayforpay.com/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                transactionType: "CHECK_STATUS",
                merchantAccount: MERCHANT_ACCOUNT,
                orderReference,
                merchantSignature: signature,
                apiVersion: 1,
            }),
        });

        const data = await res.json();
        return NextResponse.json({ transactionStatus: data.transactionStatus });
    } catch {
        return NextResponse.json({ error: "WayForPay API error" }, { status: 502 });
    }
}
