"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
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

// Polls WayForPay CHECK_STATUS every 3s, up to 10 attempts (30s total).
// Returns true only when transactionStatus === "Approved".
async function pollPaymentApproval(orderRef: string): Promise<boolean> {
    const MAX_ATTEMPTS = 10;
    const INTERVAL_MS = 3000;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
        }

        try {
            const res = await fetch(
                `/api/check-wayforpay-status?orderRef=${encodeURIComponent(orderRef)}`
            );
            if (!res.ok) continue;

            const { transactionStatus } = await res.json();

            if (transactionStatus === "Approved") return true;

            // Terminal non-approved states — stop polling immediately
            if (["Declined", "Refunded", "Voided", "Expired"].includes(transactionStatus)) {
                return false;
            }

            // InProcessing or unknown → keep polling
        } catch {
            // transient network error, retry next iteration
        }
    }

    return false; // timed out without approval
}

export default function CheckPaymentStatus() {
    const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
    const router = useRouter();
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        (async () => {
            try {
                const orderRef =
                    Cookies.get(COOKIE_KEY) ||
                    localStorage.getItem(COOKIE_KEY);

                if (!orderRef) {
                    setStatus("error");
                    return;
                }

                // Verify payment is actually approved before processing anything
                const approved = await pollPaymentApproval(orderRef);
                if (!approved) {
                    setStatus("error");
                    return;
                }

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
    }, []);

    useEffect(() => {
        if (status === "success") {
            const timer = setTimeout(() => router.push("/"), 6000);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    if (status === "checking") return <Message title="Перевіряємо оплату…" description="Зачекайте, це займе до 30 секунд" />;
    if (status === "success") return <Message title="Успех!" description="Данные отправлены на почту" />;
    return <Message title="Ошибка" description="Попробуйте снова" />;
}
