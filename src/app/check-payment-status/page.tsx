"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Message from "@/components/success-page/Message";
import { newRequest } from "@/utils/newRequest";
import dayjs from "dayjs";
import "dayjs/locale/ru";

const COOKIE_KEY = "wayforpay_order_ref";
const ORDER_DATA_KEY = "wayforpay_order_data";

const CheckPaymentStatus = () => {
    const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
    const hasRun = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const orderRef = Cookies.get(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY);
        if (!orderRef) {
            setStatus("error");
            return;
        }

        const checkStatus = async () => {
            try {
                const statusRes = await newRequest.post("/payment/check-wayforpay-status", {
                    orderReference: orderRef,
                });

                if (statusRes.status === 200) {
                    const orderDataRaw = Cookies.get(ORDER_DATA_KEY);
                    if (!orderDataRaw) {
                        setStatus("error");
                        return;
                    }
                    const orderData = JSON.parse(orderDataRaw);

                    const payerEmail = "dokee.pro@gmail.com";
                    const formattedDate = orderData.selectedDate
                        ? dayjs(orderData.selectedDate).locale("ru").format("D MMMM YYYY года")
                        : undefined;

                    const formData = new FormData();
                    formData.append("email", payerEmail);
                    formData.append("languagePair", `${orderData.fromLanguage}-${orderData.toLanguage}`);
                    formData.append("tariff", orderData.selectedTariff || "");
                    formData.append("samples", JSON.stringify(orderData.selectedSamples));
                    formData.append("totalValue", "0"); // якщо не треба рахувати — ставимо 0
                    if (formattedDate) formData.append("selectedDate", formattedDate);

                    await newRequest.post("/documents/send-data", formData);
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch {
                setStatus("error");
            } finally {
                localStorage.removeItem(COOKIE_KEY);
                Cookies.remove(COOKIE_KEY);
                Cookies.remove(ORDER_DATA_KEY);
                setTimeout(() => router.push("/"), 6000);
            }
        };

        checkStatus();
    }, []);

    if (status === "checking") {
        return <Message title="Проверяем статус платежа..." description="Это займет несколько секунд" />;
    }
    if (status === "success") {
        return <Message title="Успешно! Платеж подтверждён!" description="Данные отправлены на почту" />;
    }
    return <Message title="Ошибка" description="Попробуйте снова через некоторое время" />;
};

export default CheckPaymentStatus;
