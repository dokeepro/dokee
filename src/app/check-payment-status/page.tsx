"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Message from "@/components/success-page/Message";

function CheckPaymentContent() {
    const searchParams = useSearchParams();
    const ran = useRef(false);
    const [status, setStatus] = useState<"processing" | "done">("processing");

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const orderRef = searchParams.get("orderRef");

        if (orderRef) {
            fetch("/api/complete-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderReference: orderRef }),
                signal: AbortSignal.timeout(90000),
            })
                .then(() => setStatus("done"))
                .catch(() => setStatus("done"));
        } else {
            setStatus("done");
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === "done") {
            setTimeout(() => {
                window.location.href = "/";
            }, 3000);
        }
    }, [status]);

    return (
        <Message
            title={status === "processing" ? "Обработка заказа..." : "Спасибо за оплату!"}
            description={
                status === "processing"
                    ? "Отправляем ваши документы. Пожалуйста, не закрывайте эту страницу"
                    : "Ваш заказ принят и данные отправлены. Вы будете перенаправлены на главную через несколько секунд"
            }
            showButton={status === "done"}
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
