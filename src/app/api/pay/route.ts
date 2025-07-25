import { NextRequest, NextResponse } from 'next/server';


type WayforpayParams = {
    merchantAccount: string;
    merchantDomainName: string;
    orderReference: string;
    orderDate: number;
    amount: number;
    currency: 'KZT';
    productName: string[];
    productPrice: number[];
    productCount: number[];
    returnUrl: string;
    serviceUrl: string;
};

export async function POST(req: NextRequest) {
    const { amount } = await req.json();

    const orderReference = `order_${Date.now()}`;
    const merchantLogin = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_LOGIN!;
    const secretKey = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET_KEY!;

    const time = Math.floor(Date.now() / 1000);

    const params: WayforpayParams = {
        merchantAccount: merchantLogin,
        merchantDomainName: 'www.dokee.pro',
        orderReference,
        orderDate: time,
        amount,
        currency: 'KZT',
        productName: ['Оплата'],
        productPrice: [amount],
        productCount: [1],
        returnUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success`,
        serviceUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/pay/callback`
    };

    const signatureString = [
        params.merchantAccount,
        params.merchantDomainName,
        params.orderReference,
        params.orderDate,
        params.amount,
        params.currency,
        params.productName[0],
        params.productCount[0],
        params.productPrice[0]
    ].join(';');

    const crypto = await import('crypto');
    const signature = crypto
        .createHash('sha1')
        .update(signatureString + secretKey)
        .digest('base64');

    const formHtml = `
    <form id="payForm" method="POST" action="https://secure.wayforpay.com/pay">
      ${Object.entries({
        ...params,
        merchantSignature: signature
    })
        .map(([k, v]) =>
            Array.isArray(v)
                ? v.map(item => `<input type="hidden" name="${k}[]" value="${item}"/>`).join('\n')
                : `<input type="hidden" name="${k}" value="${v}"/>`
        )
        .join('\n')}
    </form>
    <script>document.getElementById("payForm").submit();</script>
  `;

    return new NextResponse(formHtml, {
        headers: { 'Content-Type': 'text/html' }
    });
}
