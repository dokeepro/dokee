"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
    const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
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

                if (!orderRef) {
                    setStatus("error");
                    return;
                }

                // Payment is always confirmed by the time user returns from WayForPay
                // Proceed directly to sending order data

                const [filesData, metadata] = await Promise.all([
                    getOrderData<StoredFile[]>(`files_${orderRef}`),
                    getOrderData<OrderMetadata>(`metadata_${orderRef}`),
                ]);

                if (!metadata) {
                    setStatus("error");
                    return;
                }

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

                const [emailRes, tgRes] = await Promise.all([
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

                if (emailRes.ok || tgRes.ok) {
                    await Promise.all([
                        deleteOrderData(`files_${orderRef}`),
                        deleteOrderData(`metadata_${orderRef}`),
                    ]);
                    Cookies.remove(COOKIE_KEY);
                    localStorage.removeItem(COOKIE_KEY);
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch (err) {
                console.error("Error processing order:", err);
                setStatus("error");
            }
        })();
    }, [searchParams]);

    if (status === "checking") {
        return (
            <Message
                title="Проверяем оплату…"
                description="Подождите, это займёт несколько секунд"
                showButton={false}
            />
        );
    }

    if (status === "success") {
        return (
            <Message
                autoRedirect
                title="Спасибо за оплату!"
                description="Ваш заказ принят и данные отправлены. Вы будете перенаправлены на главную через несколько секунд"
            />
        );
    }

    return (
        <Message
            autoRedirect
            title="Ошибка оплаты"
            description="Не удалось подтвердить оплату. Попробуйте снова или свяжитесь с поддержкой"
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
