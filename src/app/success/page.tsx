"use client";

import React, { useEffect } from 'react';
import Message from '@/components/success-page/Message';
import { newRequest } from "@/utils/newRequest";

const Page = () => {
    useEffect(() => {
        const checkPaymentStatus = async () => {
            const orderReference = localStorage.getItem("wayforpay_order_ref");
            if (!orderReference) return;

            try {
                const res = await newRequest.post("/payment/check-wayforpay-status", {
                    orderReference,
                });

                const status = res?.data?.transactionStatus || res?.data?.transactionStatusList?.[0]?.transactionStatus;

                if (status === "Approved") {
                    console.log("✅ Все заебись");
                } else {
                    console.warn("❌ Статус не подтвержден:", status);
                }
            } catch (err) {
                console.error("Ошибка при проверке платежа", err);
            }
        };

        checkPaymentStatus();
    }, []);

    return (
        <Message
            title="Оплата успешна!"
            description="Спасибо за использования нашим сервисом! Ваши данные были успешно отправлены. Через несколько секунд мы вернём вас на главную страницу"
        />
    );
};

export default Page;
