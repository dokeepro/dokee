"use client";

import React from "react";
import { newRequest } from "@/utils/newRequest";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";

type Product = {
    sampleTitle: string;
    price: number | string;
    count?: number | string;
};

interface WayforpayRedirectButtonProps {
    products: Product[];
    totalValue: number | string;
    currency?: string;
    clientEmail?: string;
    loading?: boolean;
    onSuccess?: () => Promise<{ success: boolean }>;
}

const WayforpayRedirectButton: React.FC<WayforpayRedirectButtonProps> = ({
                                                                             products,
                                                                             totalValue,
                                                                             currency = "KZT",
                                                                             onSuccess,
                                                                             loading,
                                                                             clientEmail = "dokee.pro@gmail.com",
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

            const productName = products.map((p) => p.sampleTitle);
            const productPrice = products.map((p) => String(p.price));
            const productCount = products.map((p) => String(p.count ?? 1));
            const amount = String(totalValue);

            const returnUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success`;
            const serviceUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/wayforpay-callback`;

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
                clientEmail,
                returnUrl,
                serviceUrl,
            };

            window.addEventListener("message", async (event) => {
                try {
                    if (event.data?.transactionStatus === "Approved" && onSuccess) {
                        const result = await onSuccess();
                        if (result?.success) {
                            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success`;
                        } else {
                            window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/error`;
                        }
                    } else {
                        window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/error`;
                    }
                } catch (err) {
                    console.error("Post-payment logic failed:", err);
                    window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/error`;
                }
            });

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