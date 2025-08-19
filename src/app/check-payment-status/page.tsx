"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Message from "@/components/success-page/Message";
import { newRequest } from "@/utils/newRequest";

const COOKIE_KEY = "wayforpay_order_ref";

export default function CheckPaymentStatus() {
    const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
    const router = useRouter();
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        (async () => {
            try {
                const orderRef =
                    Cookies.get(COOKIE_KEY) ||
                    localStorage.getItem(COOKIE_KEY);

                if (!orderRef) {
                    setStatus("error");
                    return;
                }

                const res = await newRequest.post("/payment/check-wayforpay-status", { orderReference: orderRef });

                if (res.status === 200) {
                    setStatus("success");
                    setTimeout(() => router.push("/"), 6000);
                } else {
                    setStatus("error");
                }
            } catch (err) {
                setStatus("error");
                console.error("Error checking payment status:", err);
            } finally {
            }
        })();
    }, []);

    if (status === "checking") return <Message title="Отправляем данные…" description="Это займет несколько секунд" />;
    if (status === "success")  return <Message title="Успех!" description="Данные отправлены на почту" />;
    return <Message title="Ошибка" description="Попробуйте снова" />;
}