"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import Message from "@/components/success-page/Message";

const COOKIE_KEY = "wayforpay_order_ref";

function CheckPaymentContent() {
    const searchParams = useSearchParams();
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const orderRef =
            searchParams.get("orderRef") ||
            Cookies.get(COOKIE_KEY) ||
            localStorage.getItem(COOKIE_KEY);

        if (orderRef) {
            Cookies.remove(COOKIE_KEY);
            localStorage.removeItem(COOKIE_KEY);

            fetch("/api/complete-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderReference: orderRef }),
                signal: AbortSignal.timeout(90000),
            }).catch((err) => console.error("Fallback complete-order failed:", err));
        }

        setTimeout(() => {
            window.location.href = "/";
        }, 4000);
    }, [searchParams]);

    return (
        <Message
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
