"use client";

import { useEffect, useRef, useState } from "react";
import Message from "@/components/success-page/Message";

export default function CheckPaymentStatus() {
    const ran = useRef(false);
    const [status, setStatus] = useState<"processing" | "done">("processing");

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const raw = localStorage.getItem("pending_order");
        localStorage.removeItem("pending_order");

        if (raw) {
            fetch("/api/complete-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: raw,
                signal: AbortSignal.timeout(90000),
            })
                .then(() => setStatus("done"))
                .catch(() => setStatus("done"));
        } else {
            setStatus("done");
        }
    }, []);

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
