import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import crypto from "crypto";
import { loadOrderFromBlob, completeOrder } from "@/lib/completeOrder";
import { WAYFORPAY_SECRET_KEY } from "@/lib/env";

export const maxDuration = 120;

const SECRET_KEY = WAYFORPAY_SECRET_KEY;

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

// WayForPay's serviceUrl callback is inconsistent: it may arrive as plain JSON,
// or as x-www-form-urlencoded where the ENTIRE JSON payload is a single key with
// an empty value (their PHP client does http_build_query on a JSON string). Naively
// running URLSearchParams over that mangles the payload and loses orderReference,
// so we try every shape until we get a real object.
function tryParseJson(text: string): WayForPayPayload | null {
    try {
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === "object" ? (parsed as WayForPayPayload) : null;
    } catch {
        return null;
    }
}

async function readWayForPayBody(req: NextRequest): Promise<WayForPayPayload> {
    const raw = (await req.text()).trim();
    if (!raw) return {};

    // 1. Plain JSON body.
    const asJson = tryParseJson(raw);
    if (asJson) return asJson;

    // 2. urlencoded — the JSON payload is usually the key (value empty), sometimes
    //    the value. Decode and try to JSON-parse each side.
    const params = new URLSearchParams(raw);
    for (const [key, value] of params) {
        const fromValue = value && tryParseJson(value);
        if (fromValue) return fromValue;
        const fromKey = tryParseJson(key);
        if (fromKey) return fromKey;
    }

    // 3. Genuine key=value form encoding.
    const obj: Record<string, string> = {};
    params.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
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
        console.log(`[wayforpay-callback] keys=${Object.keys(body).join(",")} ref=${orderReference} status=${asString(body.transactionStatus)}`);

        if (!orderReference) {
            console.warn("[wayforpay-callback] no orderReference in body — parse/format issue");
            return NextResponse.json({ status: "accept", time: Date.now() });
        }

        const receivedSignature = asString(body.merchantSignature);
        const expectedSignature = generateSignature(body);

        if (!receivedSignature || expectedSignature !== receivedSignature) {
            console.warn(`[wayforpay-callback] signature mismatch for ${orderReference} (received=${receivedSignature ? "yes" : "no"})`);
            return okAck(orderReference);
        }

        const transactionStatus = asString(body.transactionStatus);
        if (transactionStatus === "Approved" || transactionStatus === "Completed") {
            after(async () => {
                try {
                    const order = await loadOrderFromBlob(orderReference);
                    if (!order) {
                        console.log(`[wayforpay-callback] no order found for ${orderReference}, client will handle`);
                        return;
                    }
                    const result = await completeOrder(order);
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
