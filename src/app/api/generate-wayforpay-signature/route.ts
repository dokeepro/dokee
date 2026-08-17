import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { WAYFORPAY_SECRET_KEY } from "@/lib/env";

const SECRET_KEY = WAYFORPAY_SECRET_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!SECRET_KEY) {
            return NextResponse.json({ error: "Secret key not configured" }, { status: 500 });
        }

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
        } = await req.json();

        const names = Array.isArray(productName) ? productName : [productName];
        const counts = Array.isArray(productCount) ? productCount : [productCount];
        const prices = Array.isArray(productPrice) ? productPrice : [productPrice];

        // WayForPay purchase signature field order:
        // merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;name1;...;count1;...;price1;...
        const signatureString = [
            merchantAccount,
            merchantDomainName,
            orderReference,
            String(orderDate),
            String(amount),
            currency,
            ...names,
            ...counts,
            ...prices,
        ].join(";");

        const signature = crypto
            .createHmac("md5", SECRET_KEY)
            .update(signatureString)
            .digest("hex");

        return NextResponse.json({ signature });
    } catch (err) {
        console.error("Signature generation failed:", err);
        return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
    }
}
