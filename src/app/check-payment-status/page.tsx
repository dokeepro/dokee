"use client";

import { useEffect, useRef } from "react";
import Message from "@/components/success-page/Message";

export default function CheckPaymentStatus() {
    const ran = useRef(false);

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
            }).catch(() => {});
        }

        setTimeout(() => {
            window.location.href = "/";
        }, 3000);
    }, []);

    return (
        <Message
            title="Спасибо за оплату!"
            description="Ваш заказ принят. Вы будете перенаправлены на главную через несколько секунд"
            showButton={true}
        />
    );
}
