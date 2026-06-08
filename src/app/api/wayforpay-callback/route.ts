import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import crypto from "crypto";
import { completeOrder } from "@/lib/completeOrder";

const SECRET_KEY = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY!;

type WayForPayPayload = Record<string, unknown>;

const SIGN_FIELDS = [
    "merchantAccount",
    "orderReference",
    "amount",
    "currency",
    "authCode",
    "cardPan",
    "transactionStatus",
    "reasonCode",
] as const;

const asString = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (Array.isArray(v)) return v.map(asString).join(",");
    if (typeof v === "number" || typeof v === "bigint" || typeof v === "boolean") return String(v);
    if (typeof v === "string") return v;
    return String(v);
};

const generateSignature = (data: WayForPayPayload): string => {
    const signatureString = SIGN_FIELDS.map((key) => asString(data[key])).join(";");
    return crypto.createHmac("md5", SECRET_KEY).update(signatureString).digest("hex");
};

async function readWayForPayBody(req: NextRequest): Promise<WayForPayPayload> {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
        const text = await req.text();
        const params = new URLSearchParams(text);
        const obj: Record<string, string> = {};
        params.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }

    return (await req.json()) as WayForPayPayload;
}

function okAck(orderReference: string) {
    return NextResponse.json({
        orderReference,
        status: "accept",
        time: Date.now(),
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await readWayForPayBody(req);
        const orderReference = asString(body.orderReference);

        if (!orderReference) {
            return NextResponse.json({ status: "accept", time: Date.now() });
        }

        const receivedSignature = asString(body.merchantSignature);
        const expectedSignature = generateSignature(body);

        if (!receivedSignature || expectedSignature !== receivedSignature) {
            return okAck(orderReference);
        }

        const transactionStatus = asString(body.transactionStatus);
        if (transactionStatus === "Approved" || transactionStatus === "Completed") {
            after(async () => {
                try {
                    const result = await completeOrder(orderReference);
                    console.log(`[wayforpay-callback] completeOrder for ${orderReference}:`, result);
                } catch (err) {
                    console.error(`[wayforpay-callback] completeOrder failed:`, err);
                }
            });
        }

        return okAck(orderReference);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: "accept", time: Date.now() });
    }
}
