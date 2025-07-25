import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const {
        merchantAccount,
        merchantDomainName,
        orderReference,
        orderDate,
        amount,
        currency,
        productName,
        productCount,
        productPrice,
    } = body;

    const secretKey = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY!;
    const signatureSource = [
        merchantAccount,
        merchantDomainName,
        orderReference,
        orderDate,
        amount,
        currency,
        ...productName,
        ...productCount,
        ...productPrice,
    ].join(";");

    const signature = crypto
        .createHash("sha1")
        .update(signatureSource + secretKey)
        .digest("hex");

    return NextResponse.json({ signature });
}
