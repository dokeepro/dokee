"use client";

import { Suspense, useEffect, useRef } from "react";
import Message from "@/components/success-page/Message";

function CheckPaymentContent() {
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        setTimeout(() => {
            window.location.href = "/";
        }, 4000);
    }, []);

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
