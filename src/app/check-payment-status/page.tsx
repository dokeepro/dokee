"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Message from "@/components/success-page/Message";
import { newRequest } from "@/utils/newRequest";
import "dayjs/locale/ru";
import dayjs from "dayjs";
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
    languageTariffs?: LanguageTariff[];
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
    image?: string;
}
const COOKIE_KEY = "wayforpay_order_ref";
interface UploadedFileData {
    name: string;
    type: string;
    size: number;
    dataUrl: string;
}
const toLangMap: Record<string, string> = {
    русский: "ru", английский: "en", украинский: "uk", немецкий: "de", польский: "pl",
    французский: "fr", итальянский: "it", испанский: "es", литовский: "lt", португальский: "pt",
    чешский: "cz", греческий: "el", японский: "ja", китайский: "zh", корейский: "ko",
    турецкий: "tr", казахский: "kk", узбекский: "uz", румынский: "ro", болгарский: "bg",
    венгерский: "hu", словацкий: "sk", словенский: "sl", финский: "fi", шведский: "sv",
    датский: "da", норвежский: "no", нидерландский: "nl", эстонский: "et", латышский: "lv",
    армянский: "hy", грузинский: "ka", азербайджанский: "az",
};

export default function CheckPaymentStatus() {
    const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
    const router = useRouter();
    const ran = useRef(false);

    function getSamplePrice(sample: SelectedSample, toLanguage: string, tariff: string, toLangMap: Record<string, string>) {
        const toLangRaw = (toLanguage || "").toLowerCase().trim();
        const normalizedToLang = toLangMap[toLangRaw] || toLangRaw;
        const tariffKey = (tariff?.toLowerCase() || "normal") as "normal" | "express" | "fast";
        const langTariff = sample.languageTariffs?.find((t: LanguageTariff) => {
            if (!t.language) return false;
            const lang = t.language.toLowerCase();
            return lang.includes("_") || lang.includes("-")
                ? lang.split(/[_\s-]+/).includes(normalizedToLang)
                : lang === normalizedToLang;
        });
        return langTariff ? (langTariff[tariffKey] || 0) : 0;
    }

    const handleSendData = async () => {
        try {
            const raw = localStorage.getItem("wayforpay_order_data_full");
            if (!raw) { setStatus("error"); return; }
            const data = JSON.parse(raw);

            const samplesForEmail = (data.selectedSamples || []).map((sample: SelectedSample) => ({
                ...sample,
                computedPrice: getSamplePrice(sample, data.toLanguage, data.tariff, toLangMap),
            }));

            const formData = new FormData();
            formData.append("email", "dokee.pro@gmail.com");
            formData.append("languagePair", data.localLanguagePair || `${data.fromLanguage} - ${data.toLanguage}`);
            formData.append("tariff", data.tariff || "");
            formData.append("samples", JSON.stringify(samplesForEmail));
            let totalValue = 0;
            if (data.tariff === "Normal") totalValue = data.totalPriceNormal || 0;
            else if (data.tariff === "Express") totalValue = data.totalPriceExpress || 0;
            else if (data.tariff === "Fast") totalValue = data.totalPriceFast || 0;
            formData.append("totalValue", String(totalValue));
            if (data.selectedDate) {
                formData.append("selectedDate", dayjs(data.selectedDate).locale("ru").format("D MMMM YYYY года"));
            }
            (data.uploadedFiles || []).forEach((file: UploadedFileData, i: number) => {
                const arr = file.dataUrl.split(",");
                const mime = arr[0].match(/:(.*?);/)?.[1] || "";
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) u8arr[n] = bstr.charCodeAt(n);
                const blob = new Blob([u8arr], { type: mime });
                formData.append("files", blob, file.name || `file-${i}`);
            });

            const res = await newRequest.post("/documents/send-data", formData);
            setStatus(res.status === 200 ? "success" : "error");
            if (res.status === 200) {
                setTimeout(() => router.push("/"), 6000);
            }
        } catch (err) {
            setStatus("error");
            console.error("Error sending data:", err);
        }
    };

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        (async () => {
            try {
                const orderRef = Cookies.get(COOKIE_KEY) || localStorage.getItem(COOKIE_KEY);
                if (!orderRef) { setStatus("error"); return; }

                const statusRes = await newRequest.post("/payment/check-wayforpay-status", {
                    orderReference: orderRef,
                });

                if (statusRes.status === 200) {
                    await handleSendData();
                } else {
                    setStatus("error");
                }
            } catch {
                setStatus("error");
            } finally {
                localStorage.removeItem(COOKIE_KEY);
                Cookies.remove(COOKIE_KEY);
            }
        })();
    }, []);

    if (status === "checking") return <Message title="Отправляем данные…" description="Это займет несколько секунд" />;
    if (status === "success")  return <Message title="Успех!" description="Данные отправлены на почту" />;
    return <Message title="Ошибка" description="Попробуйте снова" />;
}