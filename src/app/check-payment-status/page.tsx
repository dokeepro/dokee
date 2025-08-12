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

const toLangMap: Record<string, string> = {
    русский: "ru",
    английский: "en",
    украинский: "uk",
    немецкий: "de",
    польский: "pl",
    французский: "fr",
    итальянский: "it",
    испанский: "es",
    литовский: "lt",
    португальский: "pt",
    чешский: "cz",
    греческий: "el",
    японский: "ja",
    китайский: "zh",
    корейский: "ko",
    турецкий: "tr",
    казахский: "kk",
    узбекский: "uz",
    румынский: "ro",
    болгарский: "bg",
    венгерский: "hu",
    словацкий: "sk",
    словенский: "sl",
    финский: "fi",
    шведский: "sv",
    датский: "da",
    норвежский: "no",
    нидерландский: "nl",
    эстонский: "et",
    латышский: "lv",
    армянский: "hy",
    грузинский: "ka",
    азербайджанский: "az",
};

interface LanguageTariff {
    language: string;
    normal: number;
    express: number;
    fast: number;
}

interface SelectedSample {
    id: string;
    docName: string;
    sampleTitle: string;
    languageTariffs: LanguageTariff[];
    image?: string;
}

interface UploadedFileMeta {
    name: string;
    type: string;
    size: number;
}

interface OrderData {
    selectedSamples: SelectedSample[];
    fromLanguage: string;
    toLanguage: string;
    selectedTariff: string;
    selectedDate: string | null;
    uploadedFiles: UploadedFileMeta[];
}

function getTotalValueByTariff(
    selectedSamples: SelectedSample[],
    tariff: string,
    toLanguage: string
): number {
    const toLangRaw = toLanguage?.toLowerCase() || "";
    const normalizedToLang = toLangMap[toLangRaw] || toLangRaw;
    const tariffKey = (tariff?.toLowerCase() || "normal") as "normal" | "express" | "fast";
    let total = 0;
    selectedSamples.forEach((sample) => {
        const langTariff = sample.languageTariffs?.find((t) => {
            if (!t.language) return false;
            const lang = t.language.toLowerCase();
            if (lang.includes("_") || lang.includes("-")) {
                return lang.split(/[_\s-]+/).includes(normalizedToLang);
            }
            return lang === normalizedToLang;
        });
        total += langTariff ? langTariff[tariffKey] || 0 : 0;
    });
    return total;
}

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
                const wfp = statusRes.data || {};
                const orderStatus = String(wfp.orderStatus || wfp.transactionStatus || wfp.status || "");
                const isApproved = ["Approved", "Settled", "Ok", "success"].includes(orderStatus);

                if (!isApproved) {
                    setStatus("error");
                    return;
                }

                const orderDataRaw = Cookies.get(ORDER_DATA_KEY);
                if (!orderDataRaw) {
                    setStatus("error");
                    return;
                }
                const orderData: OrderData = JSON.parse(orderDataRaw);

                const payerEmail =
                    wfp.email || wfp.payerEmail || (wfp.paymentInfo && wfp.paymentInfo.email) || "dokee.pro@gmail.com";

                const formattedDate = orderData.selectedDate
                    ? dayjs(orderData.selectedDate).locale("ru").format("D MMMM YYYY года")
                    : undefined;

                const totalValue = getTotalValueByTariff(
                    orderData.selectedSamples,
                    orderData.selectedTariff,
                    orderData.toLanguage
                );

                const formData = new FormData();
                formData.append("email", String(payerEmail));
                formData.append("languagePair", `${orderData.fromLanguage}-${orderData.toLanguage}`);
                formData.append("tariff", orderData.selectedTariff || "");
                formData.append("samples", JSON.stringify(orderData.selectedSamples));
                formData.append("totalValue", totalValue.toString());
                if (formattedDate) formData.append("selectedDate", formattedDate);

                await newRequest.post("/documents/send-data", formData);
                setStatus("success");
            } catch {
                setStatus("error");
            } finally {
                localStorage.removeItem(COOKIE_KEY);
                Cookies.remove(COOKIE_KEY);
                Cookies.remove(COOKIE_KEY, { domain: ".dokee.pro" });
                Cookies.remove(ORDER_DATA_KEY);
                Cookies.remove(ORDER_DATA_KEY, { domain: ".dokee.pro" });
                setTimeout(() => router.push("/"), 6000);
            }
        };

        checkStatus();
    }, []);

    if (status === "checking") {
        return <Message title="Проверяем статус платежа..." description="Это займет несколько секунд" />;
    }
    if (status === "success") {
        return <Message title="Платеж успешен" description="Ваш заказ оформлен успешно" />;
    }
    return <Message title="Ошибка проверки платежа" description="Попробуйте снова через некоторое время" />;
};

export default CheckPaymentStatus;
