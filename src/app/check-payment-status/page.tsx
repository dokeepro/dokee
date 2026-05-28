"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import Message from "@/components/success-page/Message";
import { getOrderData, clearAllOrderData } from "@/utils/indexDbOrder";

const COOKIE_KEY = "wayforpay_order_ref";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type StoredFile = { name: string; type: string; url: string };

type OrderMetadata = {
    orderReference: string;
    samples: {
        id: string;
        docName: string;
        sampleTitle: string;
        fioLatin: string;
        sealText: string;
        stampText: string;
        computedPrice: number;
    }[];
    languagePair: string;
    tariff: string;
    totalValue: number;
    selectedDate: string | null;
};


function CheckPaymentContent() {
    const searchParams = useSearchParams();
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        (async () => {
            try {
                const orderRef =
                    searchParams.get("orderRef") ||
                    Cookies.get(COOKIE_KEY) ||
                    localStorage.getItem(COOKIE_KEY);

                if (!orderRef) return;

                const [filesData, metadata] = await Promise.all([
                    getOrderData<StoredFile[]>(`files_${orderRef}`),
                    getOrderData<OrderMetadata>(`metadata_${orderRef}`),
                ]);

                if (!metadata) return;

                const fileUrls = filesData ?? [];

                const payload = {
                    email: "dokee.pro@gmail.com",
                    orderReference: orderRef,
                    languagePair: metadata.languagePair,
                    tariff: metadata.tariff,
                    samples: metadata.samples,
                    totalValue: metadata.totalValue,
                    selectedDate: metadata.selectedDate || undefined,
                    files: fileUrls,
                };

                await Promise.all([
                    fetch(`${BACKEND_URL}/documents/send-data`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                        signal: AbortSignal.timeout(30000),
                    }),
                    fetch("/api/send-order-telegram", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                        signal: AbortSignal.timeout(30000),
                    }),
                ]);

                await clearAllOrderData();
                Cookies.remove(COOKIE_KEY);
                localStorage.removeItem(COOKIE_KEY);
            } catch (err) {
                console.error("Error sending order data:", err);
            }
        })();
    }, [searchParams]);

    return (
        <Message
            autoRedirect
            title="Спасибо за оплату!"
            description="Ваш заказ принят и данные отправлены. Вы будете перенаправлены на главную через несколько секунд"
        />
    );
}

export default function CheckPaymentStatus() {
    return (
        <Suspense fallback={<Message title="Загрузка…" description="" showButton={false} />}>
            <CheckPaymentContent />
        </Suspense>
    );
}
