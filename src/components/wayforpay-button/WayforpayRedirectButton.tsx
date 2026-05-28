"use client";

import React, { useState } from "react";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import Cookies from "js-cookie";

type Product = {
    sampleTitle: string;
    price: number | string;
    count?: number | string;
};

interface WayforpayRedirectButtonProps {
    products: Product[];
    totalValue: number | string;
    currency?: string;
    // orderReference is provided so both this component and the callback use the same reference
    onBeforeRedirect?: (orderReference: string) => Promise<void>;
}

const WayforpayRedirectButton: React.FC<WayforpayRedirectButtonProps> = ({
    products,
    totalValue,
    currency = "KZT",
    onBeforeRedirect,
}) => {
    const [loader, setLoader] = useState(false);

    const handleClick = async () => {
        setLoader(true);
        try {
            const orderReference = `order_${Date.now()}`;

            // TEST MODE: bypass WayForPay payment and go straight to checkout
            const BYPASS_PAYMENT = true;
            if (BYPASS_PAYMENT) {
                if (onBeforeRedirect) await onBeforeRedirect(orderReference);
                const isLocalhost = window.location.hostname === "localhost";
                localStorage.setItem("wayforpay_order_ref", orderReference);
                Cookies.set("wayforpay_order_ref", orderReference, {
                    domain: isLocalhost ? undefined : "dokee.pro",
                    expires: 1,
                    secure: !isLocalhost,
                });
                window.location.href = `/check-payment-status?orderRef=${encodeURIComponent(orderReference)}`;
                return;
            }

            const merchantAccount = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_ACCOUNT;
            const merchantDomainName = process.env.NEXT_PUBLIC_WAYFORPAY_DOMAIN_NAME;
            if (!merchantAccount || !merchantDomainName) {
                alert("WayForPay environment variables are not set!");
                return;
            }

            const orderDate = Math.floor(Date.now() / 1000);

            const productName = products.map((p) => p.sampleTitle);
            const productPrice = products.map((p) => String(p.price));
            const productCount = products.map((p) => String(p.count ?? 1));
            const amount = String(totalValue);

            const baseUrl =
                typeof window !== "undefined"
                    ? window.location.origin
                    : process.env.NEXT_PUBLIC_FRONTEND_URL || "";

            // returnUrl: WayForPay redirects via POST, so point to an API route
            // that converts it to a GET redirect to /check-payment-status
            const returnUrl = `${baseUrl}/api/payment-return`;
            // serviceUrl: webhook that WayForPay calls server-to-server with payment result
            const serviceUrl = `${baseUrl}/api/wayforpay-callback`;

            // Run pre-redirect save and signature generation in parallel for speed
            const [, sigRes] = await Promise.all([
                onBeforeRedirect ? onBeforeRedirect(orderReference) : Promise.resolve(),
                fetch("/api/generate-wayforpay-signature", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        merchantAccount,
                        merchantDomainName,
                        orderReference,
                        orderDate,
                        amount,
                        currency,
                        productName,
                        productPrice,
                        productCount,
                    }),
                }),
            ]);

            const data = await sigRes.json();
            if (!data.signature) {
                alert("No signature received from server");
                return;
            }

            // Persist order reference so check-payment-status can read it
            const isLocalhost = window.location.hostname === "localhost";
            localStorage.setItem("wayforpay_order_ref", orderReference);
            Cookies.set("wayforpay_order_ref", orderReference, {
                domain: isLocalhost ? undefined : "dokee.pro",
                expires: 1,
                secure: !isLocalhost,
            });

            // Build and submit WayForPay payment form
            const wayforpayData: Record<string, string | string[]> = {
                merchantAccount,
                merchantDomainName,
                merchantSignature: data.signature,
                orderReference,
                orderDate: orderDate.toString(),
                amount,
                currency,
                "productName[]": productName,
                "productPrice[]": productPrice,
                "productCount[]": productCount,
                returnUrl,
                serviceUrl,
            };

            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://secure.wayforpay.com/pay";
            form.acceptCharset = "utf-8";
            form.style.display = "none";

            Object.entries(wayforpayData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((v) => {
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = key;
                        input.value = v;
                        form.appendChild(input);
                    });
                } else {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                }
            });

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            alert("Unexpected error: " + (err as Error).message);
            setLoader(false);
            console.error(err);
        }
    };

    return (
        <ButtonOutlined type="button" onClick={handleClick} loading={loader}>
            Перейти к оплате
        </ButtonOutlined>
    );
};

export default WayforpayRedirectButton;
