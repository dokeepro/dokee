"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Message from "@/components/success-page/Message";
import { newRequest } from "@/utils/newRequest";
import { useSampleStore } from "@/store/sampleStore";

const COOKIE_KEY = "wayforpay_order_ref";
const COOKIE_DOMAINS = ["localhost", "dokee.pro"];

const CheckPaymentStatus = () => {
    const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
    const hasRun = useRef(false);

    const {
        selectedSamples,
        fromLanguage,
        toLanguage,
        selectedTariff,
        uploadedFiles,
        selectedDate,
        clearAll
    } = useSampleStore();

    const router = useRouter();

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const orderRef =
            Cookies.get(COOKIE_KEY) ||
            localStorage.getItem(COOKIE_KEY);

        if (!orderRef) {
            setStatus("error");
            return;
        }

        const checkStatus = async () => {
            try {
                const statusRes = await newRequest.post("/payment/check-wayforpay-status", {
                    orderReference: orderRef,
                });

                const isApproved = statusRes.data.transactionStatus === "Approved";

                if (isApproved) {
                    const formData = new FormData();
                    formData.append("email", "yaroslav7v@gmail.com");
                    formData.append("languagePair", `${fromLanguage}-${toLanguage}`);
                    formData.append("tariff", selectedTariff || "");
                    formData.append("samples", JSON.stringify(selectedSamples));
                    formData.append("totalValue", "тут_порахований_total");

                    if (selectedDate) {
                        formData.append("selectedDate", selectedDate.locale("ru").format("D MMMM YYYY года"));
                    }

                    uploadedFiles.forEach((file) => {
                        formData.append("files", file);
                    });

                    await newRequest.post("/documents/send-data", formData);
                    setStatus("success");
                    clearAll();
                } else {
                    setStatus("error");
                }

                localStorage.removeItem(COOKIE_KEY);
                COOKIE_DOMAINS.forEach(domain => {
                    Cookies.remove(COOKIE_KEY, { domain });
                });

                Cookies.set("wayforpay_status_cooldown", "1", {
                    expires: 1 / (24 * 60 * 4), // 15 хв / 60 = 0.0104 дня
                    domain: window.location.hostname.includes("localhost") ? "localhost" : "dokee.pro"
                });

            } catch (e) {
                console.error("Error checking status or sending data", e);
                setStatus("error");
            } finally {
                setTimeout(() => {
                    router.push("/");
                }, 6000);
            }
        };

        const cooldown = Cookies.get("wayforpay_status_cooldown");
        if (!cooldown) {
            checkStatus();
        } else {
            console.warn("Повторна перевірка відкладена через cooldown");
            setStatus("error");
        }
    }, []);

    if (status === "checking") {
        return (
            <Message
                title="Проверяем статус платежа..."
                description="Это займет несколько секунд"
            />
        );
    }

    if (status === "success") {
        return (
            <Message
                title="Платеж успешен"
                description="Ваш заказ оформлен успешно"
            />
        );
    }

    return (
        <Message
            title="Ошибка проверки платежа"
            description="Попробуйте снова через некоторое время"
        />
    );
};

export default CheckPaymentStatus;
