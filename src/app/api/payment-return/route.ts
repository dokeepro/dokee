import { NextRequest, NextResponse } from "next/server";

async function extractOrderRef(req: NextRequest): Promise<string> {
    const fromQuery = req.nextUrl.searchParams.get("orderReference");
    if (fromQuery) return fromQuery;

    try {
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/x-www-form-urlencoded")) {
            const text = await req.text();
            const params = new URLSearchParams(text);
            return params.get("orderReference") || "";
        }
        const body = await req.json();
        return body.orderReference || "";
    } catch {
        return "";
    }
}

export async function POST(req: NextRequest) {
    const baseUrl = req.nextUrl.origin;
    const orderRef = await extractOrderRef(req);
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
