"use client";

import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import Message from "@/components/success-page/Message";

const COOKIE_KEY = "wayforpay_order_ref";

export default function CheckPaymentStatus() {
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        Cookies.remove(COOKIE_KEY);
        localStorage.removeItem(COOKIE_KEY);

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
