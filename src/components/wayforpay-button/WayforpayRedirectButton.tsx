"use client";

import React from "react";
import { newRequest } from "@/utils/newRequest";
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
    loading?: boolean;
    onSuccess?: () => Promise<{ success: boolean }>;
    onBeforeRedirect?: () => Promise<void>;
}
const WayforpayRedirectButton: React.FC<WayforpayRedirectButtonProps> = ({
                                                                             products,
                                                                             totalValue,
                                                                             currency = "KZT",
                                                                             loading,
                                                                             onBeforeRedirect,
                                                                         }) => {
    const handleClick = async () => {
        try {
            const merchantAccount = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_ACCOUNT;
            const merchantDomainName = process.env.NEXT_PUBLIC_WAYFORPAY_DOMAIN_NAME;
            if (!merchantAccount || !merchantDomainName) {
                alert("WayForPay environment variables are not set!");
                return;
            }

            const orderReference = `order_${Date.now()}`;
            const orderDate = Math.floor(Date.now() / 1000);
            if (onBeforeRedirect) {
                await onBeforeRedirect();
            }
            const productName = products.map((p) => p.sampleTitle);
            const productPrice = products.map((p) => String(p.price));
            const productCount = products.map((p) => String(p.count ?? 1));
            const amount = String(totalValue);

            const baseUrl =
                typeof window !== "undefined"
                    ? window.location.origin
                    : process.env.NEXT_PUBLIC_FRONTEND_URL || "";

            const returnUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/redirect-to-dokee`;
            const serviceUrl = `${baseUrl}/api/wayforpay-callback`;

            const res = await newRequest.post("/payment/generate-wayforpay-signature", {
                merchantAccount,
                merchantDomainName,
                orderReference,
                orderDate,
                amount,
                currency,
                productName,
                productPrice,
                productCount,
                returnUrl,
                serviceUrl,
            });

            const data = res.data;
            if (!data.signature) {
                alert("No signature received from server");
                return;
            }

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

            localStorage.setItem("wayforpay_order_ref", orderReference);
            const isLocalhost = window.location.hostname === "localhost";

            Cookies.set("wayforpay_order_ref", orderReference, {
                domain: isLocalhost ? undefined : "dokee.pro",
                expires: 1,
                secure: !isLocalhost,
            });

            form.submit();
        } catch (err) {
            alert("Unexpected error: " + (err as Error).message);
            console.error(err);
        }
    };

    return (
        <ButtonOutlined type="button" onClick={handleClick}>
            {loading ? "Обработка..." : "Перейти к оплате"}
        </ButtonOutlined>
    );
};

export default WayforpayRedirectButton;
