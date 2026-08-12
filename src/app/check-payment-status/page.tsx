"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Message from "@/components/success-page/Message";

function CheckPaymentStatusInner() {
    const ran = useRef(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        // The real order is identified by orderRef in the URL (set by WayForPay's
        // return redirect). We complete it server-side from Blob, so delivery is
        // independent of THIS device's localStorage — which may hold a different,
        // older order (e.g. when the payment link was created on another device).
        const orderRef = searchParams.get("orderRef");
        localStorage.removeItem("pending_order");

        if (orderRef) {
            fetch("/api/complete-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderReference: orderRef }),
                signal: AbortSignal.timeout(90000),
            }).catch(() => {});
        }

        setTimeout(() => {
            window.location.href = "/";
        }, 3000);
    }, [searchParams]);

    return (
        <Message
            title="Спасибо за оплату!"
            description="Ваш заказ принят. Вы будете перенаправлены на главную через несколько секунд"
            showButton={true}
        />
    );
}

export default function CheckPaymentStatus() {
    return (
        <Suspense fallback={<Message title="Спасибо за оплату!" description="Обработка заказа..." showButton={false} />}>
            <CheckPaymentStatusInner />
        </Suspense>
    );
}
