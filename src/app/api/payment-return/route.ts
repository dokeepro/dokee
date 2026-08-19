import { NextRequest, NextResponse } from "next/server";

function tryParseJson(text: string): Record<string, unknown> | null {
    try {
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}

async function extractOrderRef(req: NextRequest): Promise<string> {
    // Primary source: the query param we embed in returnUrl ourselves. WayForPay
    // preserves the returnUrl query string, so this is independent of its body.
    const fromQuery = req.nextUrl.searchParams.get("orderReference");
    if (fromQuery) return fromQuery;

    // Fallback: parse WayForPay's POST body. It may be plain JSON, or the mangled
    // urlencoded shape where the whole JSON payload is a single key with empty value.
    try {
        const raw = (await req.text()).trim();
        if (!raw) return "";

        const asJson = tryParseJson(raw);
        if (asJson) return (asJson.orderReference as string) || "";

        const params = new URLSearchParams(raw);
        const direct = params.get("orderReference");
        if (direct) return direct;

        for (const [key, value] of params) {
            const fromValue = value ? tryParseJson(value) : null;
            if (fromValue?.orderReference) return fromValue.orderReference as string;
            const fromKey = tryParseJson(key);
            if (fromKey?.orderReference) return fromKey.orderReference as string;
        }
        return "";
    } catch {
        return "";
    }
}

export async function POST(req: NextRequest) {
    const baseUrl = req.nextUrl.origin;
    const orderRef = await extractOrderRef(req);
    console.log(`[payment-return] POST orderRef=${orderRef || "(none)"}`);
    const url = orderRef
        ? `${baseUrl}/check-payment-status?orderRef=${encodeURIComponent(orderRef)}`
        : `${baseUrl}/check-payment-status`;
    return NextResponse.redirect(url, 303);
}

export async function GET(req: NextRequest) {
    const baseUrl = req.nextUrl.origin;
    const orderRef = req.nextUrl.searchParams.get("orderReference") || "";
    const url = orderRef
        ? `${baseUrl}/check-payment-status?orderRef=${encodeURIComponent(orderRef)}`
        : `${baseUrl}/check-payment-status`;
    return NextResponse.redirect(url, 303);
}
