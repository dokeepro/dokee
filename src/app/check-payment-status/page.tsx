"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import Message from "@/components/success-page/Message";
import { getOrderData, deleteOrderData } from "@/utils/indexDbOrder";

const COOKIE_KEY = "wayforpay_order_ref";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type StoredFile = { name: string; type: string; blob: Blob };

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

                const files = (filesData ?? []).map(
                    fd => new File([fd.blob], fd.name, { type: fd.type })
                );

                const formData = new FormData();
                formData.append("email", "dokee.pro@gmail.com");
                formData.append("languagePair", metadata.languagePair);
                formData.append("tariff", metadata.tariff);
                formData.append("samples", JSON.stringify(metadata.samples));
                formData.append("totalValue", String(metadata.totalValue));
                formData.append("orderReference", orderRef);
                if (metadata.selectedDate) {
                    formData.append("selectedDate", metadata.selectedDate);
                }
                files.forEach(file => formData.append("files", file, file.name));

                const tgForm = new FormData();
                tgForm.append("orderReference", orderRef);
                tgForm.append("languagePair", metadata.languagePair);
                tgForm.append("tariff", metadata.tariff);
                tgForm.append("samples", JSON.stringify(metadata.samples));
                tgForm.append("totalValue", String(metadata.totalValue));
                if (metadata.selectedDate) {
                    tgForm.append("selectedDate", metadata.selectedDate);
                }
                files.forEach(file => tgForm.append("files", file, file.name));

                await Promise.all([
                    fetch(`${BACKEND_URL}/documents/send-data`, {
                        method: "POST",
                        body: formData,
                        signal: AbortSignal.timeout(30000),
                    }),
                    fetch("/api/send-order-telegram", {
                        method: "POST",
                        body: tgForm,
                        signal: AbortSignal.timeout(30000),
                    }),
                ]);

                await Promise.all([
                    deleteOrderData(`files_${orderRef}`),
                    deleteOrderData(`metadata_${orderRef}`),
                ]);
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
