"use client";

import { useEffect, useRef } from "react";
import Message from "@/components/success-page/Message";

export default function CheckPaymentStatus() {
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
