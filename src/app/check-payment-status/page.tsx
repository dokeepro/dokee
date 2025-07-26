"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Message from "@/components/success-page/Message";
import { newRequest } from "@/utils/newRequest";

const COOKIE_KEY = "wayforpay_order_ref";
const COOKIE_DOMAINS = ["localhost", "dokee.pro"];
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
    чешский: "cs",
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
    _id?: string;
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

                if (statusRes.status === 200) {
                    // Read order data from cookie
                    const orderDataRaw = Cookies.get(ORDER_DATA_KEY);
                    if (!orderDataRaw) {
                        setStatus("error");
                        return;
                    }
                    const orderData: OrderData = JSON.parse(orderDataRaw);

                    // Calculate total value
                    const totalValue = getTotalValueByTariff(
                        orderData.selectedSamples,
                        orderData.selectedTariff,
                        orderData.toLanguage
                    );

                    const formData = new FormData();
                    formData.append("email", "yaroslav7v@gmail.com");
                    formData.append(
                        "languagePair",
                        `${orderData.fromLanguage}-${orderData.toLanguage}`
                    );
                    formData.append("tariff", orderData.selectedTariff || "");
                    formData.append("samples", JSON.stringify(orderData.selectedSamples));
                    formData.append("totalValue", totalValue.toString());

                    if (orderData.selectedDate) {
                        formData.append("selectedDate", orderData.selectedDate);
                    }

                    orderData.uploadedFiles?.forEach((file) => {
                        formData.append("files", new Blob([], { type: file.type }), file.name);
                    });

                    await newRequest.post("/documents/send-data", formData);
                    setStatus("success");
                } else {
                    setStatus("error");
                }

                localStorage.removeItem(COOKIE_KEY);
                COOKIE_DOMAINS.forEach((domain) => {
                    Cookies.remove(COOKIE_KEY, { domain });
                });
                Cookies.remove(ORDER_DATA_KEY);

                Cookies.set("wayforpay_status_cooldown", "1", {
                    expires: 1 / (24 * 60 * 4),
                    domain: window.location.hostname.includes("localhost") ? "localhost" : "dokee.pro",
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