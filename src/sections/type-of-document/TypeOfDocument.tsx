"use client";

import React, {useEffect, useRef, useState} from 'react';
import styles from "./TypeOfDocument.module.scss";
import {Accordion, AccordionDetails, AccordionSummary, Button, Skeleton, Tooltip, useMediaQuery} from "@mui/material";
import uaFlag from "@/assets/icons/ua-icon.png";
import kzFlag from "@/assets/icons/kz-icon.png";
import Image from "next/image";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import DocumentItem from "@/components/document-item/DocumentItem";
import {SelectedSample, useSampleStore} from '@/store/sampleStore';
import {Select, Option} from '@mui/joy';
import {Input} from '@mui/joy';
import Cookies from "js-cookie";
import {BsFillInfoSquareFill} from "react-icons/bs";
import timeIcon from "@/assets/icons/box-time-icon.svg"
import timeIconPurple from "@/assets/icons/box-time-purple.svg"
import timeIconWhite from "@/assets/icons/box-time-white.svg"
import fast from "@/assets/icons/fastPurple.svg"
import discountPurple from "@/assets/icons/discount-purple.svg"
import discountWhite from "@/assets/icons/discount-white.svg"
import dropFile from "@/assets/icons/file-download.svg"
import lightning from "@/assets/icons/lighting-white.svg"
import garry from "@/assets/icons/garry-icon.svg"
import discount from "@/assets/icons/discount-icon.svg"
import {newRequest} from '@/utils/newRequest';
import {HiMiniArrowsRightLeft} from "react-icons/hi2";
import TariffItem from '@/components/tariff-item/TariffItem';
import {useDocumentContext} from "@/context/DocumentContext";
import {IoIosArrowDown} from "react-icons/io";
import sealExample from "@/assets/images/seal-example.svg"
import stampExample from "@/assets/images/example-of-stamp.svg";
import warningExample from "@/assets/icons/icon-blue.svg"
import DocumentFinalItem from '@/components/document-final-item/DocumentFinalItem';
import {usePopup} from "@/context/PopupContext";
import {TiTimes} from "react-icons/ti";
import IconButton from '@mui/material/IconButton';
import {useGeneral} from "@/context/GeneralContext";
import {useAlert} from "@/context/AlertContext";
import 'dayjs/locale/ru';
import WayforpayRedirectButton from "@/components/wayforpay-button/WayforpayRedirectButton";

type WayforpayPaymentData = {
    merchantAccount: string;
    merchantDomainName: string;
    orderReference: string;
    orderDate: number;
    amount: number;
    currency: 'KZT' | 'UAH' | 'USD' | 'EUR';
    productName: string[];
    productCount: string[];
    productPrice: string[];
    clientFirstName: string;
    clientLastName: string;
    clientEmail: string;
    clientPhone: string;
    language: 'UA' | 'RU' | 'EN';
    returnUrl: string;
    serviceUrl: string;
    merchantSignature: string;
    auth: 'SimpleSignature';
    transactionType: 'SALE';
    paymentSystems: string;
    defaultPaymentSystem: string;
    holdTimeout: number;
    orderTimeout: number;
    orderLifetime: number;
};


interface WayforpayInstance {
    run: (data: WayforpayPaymentData) => void;
}

interface WayforpayConstructor {
    new(): WayforpayInstance;
}

declare global {
    interface Window {
        Wayforpay: WayforpayConstructor;
    }
}

interface LanguageTariff {
    language: string;
    normal: number;
    express: number;
    fast: number;
    _id?: string;
}

interface Sample {
    title: string;
    languageTariffs?: LanguageTariff[];
    imageUrl?: string;
    image?: string;
}

const langCodeToName: Record<string, string> = {
    ab: 'Абхазский',
    ae: 'Авестийский',
    af: 'Африкаанс',
    ak: 'Акан',
    sq: 'Албанский',
    am: 'Амхарский',
    ar: 'Арабский',
    hy: 'Армянский',
    as: 'Ассамский',
    av: 'Аварский',
    ay: 'Аймара',
    az: 'Азербайджанский',
    ba: 'Башкирский',
    be: 'Белорусский',
    bg: 'Болгарский',
    bh: 'Бихари',
    bi: 'Бислама',
    bm: 'Бамбара',
    bn: 'Бенгальский',
    bo: 'Тибетский',
    br: 'Бретонский',
    bs: 'Боснийский',
    ca: 'Каталанский',
    ce: 'Чеченский',
    ch: 'Чаморро',
    co: 'Корсиканский',
    ht: 'Креольский (Гаити)',
    cv: 'Чувашский',
    cy: 'Уэльский (Валлийский)',
    da: 'Датский',
    de: 'Немецкий',
    dv: 'Дивехи',
    el: 'Греческий',
    en: 'Английский',
    eo: 'Эсперанто',
    es: 'Испанский',
    et: 'Эстонский',
    eu: 'Баскский',
    fa: 'Персидский',
    fi: 'Финский',
    fj: 'Фиджи',
    fo: 'Фарерский',
    fy: 'Фризский',
    ga: 'Ирландский',
    gd: 'Шотландский гэльский',
    gl: 'Галицийский',
    gu: 'Гуджарати',
    gv: 'Манкс',
    he: 'Иврит',
    hi: 'Хинди',
    ho: 'Хиримоту',
    hr: 'Хорватский',
    hu: 'Венгерский',
    id: 'Индонезийский',
    is: 'Исландский',
    ja: 'Японский',
    jv: 'Яванский',
    ka: 'Грузинский',
    kg: 'Конго',
    ki: 'Кикуйю',
    kk: 'Казахский',
    kl: 'Гренландский',
    km: 'Камбоджийский (кхмерский)',
    kn: 'Каннада',
    ko: 'Корейский',
    ks: 'Кашмири',
    ku: 'Курдский',
    kv: 'Коми',
    kw: 'Корнский',
    ky: 'Киргизский',
    la: 'Латинский',
    lb: 'Люксембургский',
    lg: 'Ганда',
    li: 'Лимбургский',
    ln: 'Лингала',
    lo: 'Лаосский',
    lv: 'Латышский',
    mg: 'Малагасийский',
    mi: 'Маори',
    mk: 'Македонский',
    ml: 'Малаялам',
    mn: 'Монгольский',
    mr: 'Маратхи',
    ms: 'Малайский',
    mt: 'Мальтийский',
    bua: 'Бурятский',
    my: 'Бирманский',
    nl: 'Нидерландский',
    no: 'Норвежский',
    ne: 'Непальский',
    or: 'Ория',
    pa: 'Пенджаби',
    ps: 'Пашто',
    qu: 'Кечуа',
    rm: 'Ретороманский',
    ro: 'Румынский',
    ru: 'Русский',
    rw: 'Киньяруанда',
    sa: 'Санскрит',
    sc: 'Сардский',
    sd: 'Синдхи',
    sg: 'Санго',
    sr: 'Сербский',
    si: 'Сингальский',
    sk: 'Словацкий',
    sl: 'Словенский',
    sm: 'Самоанский',
    sn: 'Шона',
    so: 'Сомалийский',
    sh: 'Сербохорватский',
    st: 'Сесото',
    su: 'Сунданский',
    sv: 'Шведский',
    sw: 'Суахили',
    ta: 'Тамильский',
    te: 'Телугу',
    tg: 'Таджикский',
    th: 'Тайский',
    ti: 'Тигринья',
    tk: 'Туркменский',
    tl: 'Тагальский',
    tn: 'Тсвана',
    to: 'Тонганский',
    tr: 'Турецкий',
    ts: 'Цонга',
    tt: 'Татарский',
    tw: 'Твий',
    ty: 'Тахитянский',
    uk: 'Украинский',
    ur: 'Урду',
    uz: 'Узбекский',
    ve: 'Венда',
    vi: 'Вьетнамский',
    wo: 'Волоф',
    xh: 'Коса',
    yi: 'Идиш',
    yo: 'Йоруба',
    zu: 'Зулусский',
    fr_it_es: 'Французский/Итальянский/Испанский',
    pl_cz: 'Польский/Чешский',
    lt_pt: 'Литовский/Португальский',
};

const toLangMap: Record<string, string> = {
    русский: 'ru',
    английский: 'en',
    украинский: 'uk',
    немецкий: 'de',
    польский: 'pl',
    французский: 'fr',
    итальянский: 'it',
    испанский: 'es',
    литовский: 'lt',
    португальский: 'pt',
    чешский: 'cz',
    греческий: 'el',
    японский: 'ja',
    китайский: 'zh',
    корейский: 'ko',
    турецкий: 'tr',
    казахский: 'kk',
    узбекский: 'uz',
    румынский: 'ro',
    болгарский: 'bg',
    венгерский: 'hu',
    словацкий: 'sk',
    словенский: 'sl',
    финский: 'fi',
    шведский: 'sv',
    датский: 'da',
    норвежский: 'no',
    нидерландский: 'nl',
    эстонский: 'et',
    латышский: 'lv',
    армянский: 'hy',
    грузинский: 'ka',
    азербайджанский: 'az',
};

const TypeOfDocument = () => {
    const {country: activeCountry, setCountry: setActiveCountry} = useDocumentContext();
    const isMobileView = useMediaQuery('(max-width:768px)');

    const {
        selectedDocuments,
        setLanguagePair,
        setTariff,
        tariff,
        activePage,
        setActivePage
    } = useDocumentContext();

    const {showAlert} = useAlert();



    const {
        selectedSamples,
        toggleSample,
        removeSamplesForDocument,
        isSampleSelected,
        uploadedFiles,
        addUploadedFiles,
        setSampleField,
        removeUploadedFile,
        clearAll
    } = useSampleStore();

    const [fromLanguage, setFromLanguage] = useState<string | null>("русский");
    const [toLanguage, setToLanguage] = useState<string | null>("польский");
    const {openPopup, closePopup} = usePopup();

    const [loading, setLoading] = useState(false);
    const [localLanguagePair, setLocalLanguagePair] = useState<string | null>("Русский - Польский");
    const isPage1Valid = selectedSamples.length > 0;
    const isPage2Valid = !!tariff && fromLanguage !== toLanguage;
    const isPage3Valid = uploadedFiles.length > 0;
    const isPage4Valid = selectedDocuments.every((doc) =>
        doc.selectedSamples?.every(
            () => doc.fioLatin?.trim() && doc.sealText?.trim() && doc.stampText?.trim()
        )
    );
    const {documents, general, documentLoader} = useGeneral();
    const tariffsRef = useRef<HTMLDivElement>(null);
    const [tariffStep, setTariffStep] = useState(1);

    const handleSampleSelect = (sample: Sample) => {
        if (!currentDoc) return;
        const id = `${currentDoc.name}-${sample.title}`;
        toggleSample({
            id,
            docName: currentDoc.name,
            sampleTitle: sample.title,
            languageTariffs: sample.languageTariffs ?? [],
            image: sample.imageUrl || sample.image,
        });
    };

    const handleSampleDeselect = (sample: Sample) => {
        if (!currentDoc) return;
        const id = `${currentDoc.name}-${sample.title}`;
        toggleSample({
            id,
            docName: currentDoc.name,
            sampleTitle: sample.title,
            languageTariffs: sample.languageTariffs ?? [],
            image: sample.imageUrl || sample.image,
        });
    };

    const {currentDoc, setCurrentDoc} = useDocumentContext();

    const handleTariffsScroll = () => {
        const el = tariffsRef.current;
        if (!el) return;
        const scrollLeft = el.scrollLeft;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const percent = maxScroll === 0 ? 0 : scrollLeft / maxScroll;

        if (percent >= 0.99) {
            setTariffStep(3);
        } else if (percent >= 0.5) {
            setTariffStep(2);
        } else {
            setTariffStep(1);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        addUploadedFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        addUploadedFiles(files);
    };

    const handleRemoveFile = (index: number) => {
        removeUploadedFile(index);
    };
    const totalFileSizeMB = React.useMemo(() => {
        if (!uploadedFiles.length) return 0;
        const totalBytes = uploadedFiles.reduce((acc, file) => acc + file.size, 0);
        return (totalBytes / (1024 * 1024)).toFixed(2);
    }, [uploadedFiles]);
    const isFileSizeExceeded = parseFloat(totalFileSizeMB as string) > 15;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const isNextDisabled = () => {
        switch (activePage) {
            case 1:
                return !isPage1Valid;
            case 2:
                return !isPage2Valid || areAllTariffsDisabled;
            case 3:
                return !isPage3Valid || isFileSizeExceeded;
            case 4:
                return !isPage4Valid;
            default:
                return false;
        }
    };

    const handleOpenPopup = (content: React.ReactNode) => {
        openPopup(content);
    };

    const handleDocumentSelect = (docName: string, triggeredFromCheckbox = false) => {
        if (triggeredFromCheckbox) {
            removeSamplesForDocument(docName);
        } else {
            const doc = documents.find(d => d.name === docName && d.documentCountry === activeCountry.toLowerCase());
            setCurrentDoc(doc || null);
        }
        scrollToSection()
    };

    const langDisplayNameMap: Record<string, string> = {
        ab: 'Абхазский',
        ae: 'Авестийский',
        af: 'Африкаанс',
        ak: 'Акан',
        sq: 'Албанский',
        am: 'Амхарский',
        ar: 'Арабский',
        hy: 'Армянский',
        as: 'Ассамский',
        av: 'Аварский',
        ay: 'Аймара',
        az: 'Азербайджанский',
        ba: 'Башкирский',
        be: 'Белорусский',
        bg: 'Болгарский',
        bh: 'Бихари',
        bi: 'Бислама',
        bm: 'Бамбара',
        bn: 'Бенгальский',
        bo: 'Тибетский',
        br: 'Бретонский',
        bs: 'Боснийский',
        ca: 'Каталанский',
        ce: 'Чеченский',
        ch: 'Чаморро',
        co: 'Корсиканский',
        ht: 'Креольский (Гаити)',
        cv: 'Чувашский',
        cy: 'Уэльский (Валлийский)',
        da: 'Датский',
        de: 'Немецкий',
        dv: 'Дивехи',
        el: 'Греческий',
        en: 'Английский',
        eo: 'Эсперанто',
        es: 'Испанский',
        et: 'Эстонский',
        eu: 'Баскский',
        fa: 'Персидский',
        fi: 'Финский',
        fj: 'Фиджи',
        fo: 'Фарерский',
        fy: 'Фризский',
        ga: 'Ирландский',
        gd: 'Шотландский гэльский',
        gl: 'Галицийский',
        gu: 'Гуджарати',
        gv: 'Манкс',
        he: 'Иврит',
        hi: 'Хинди',
        ho: 'Хиримоту',
        hr: 'Хорватский',
        hu: 'Венгерский',
        id: 'Индонезийский',
        is: 'Исландский',
        ja: 'Японский',
        jv: 'Яванский',
        ka: 'Грузинский',
        kg: 'Конго',
        ki: 'Кикуйю',
        kk: 'Казахский',
        kl: 'Гренландский',
        km: 'Камбоджийский (кхмерский)',
        kn: 'Каннада',
        ko: 'Корейский',
        ks: 'Кашмири',
        ku: 'Курдский',
        kv: 'Коми',
        kw: 'Корнский',
        ky: 'Киргизский',
        la: 'Латинский',
        lb: 'Люксембургский',
        lg: 'Ганда',
        li: 'Лимбургский',
        ln: 'Лингала',
        lo: 'Лаосский',
        lv: 'Латышский',
        mg: 'Малагасийский',
        mi: 'Маори',
        mk: 'Македонский',
        ml: 'Малаялам',
        mn: 'Монгольский',
        mr: 'Маратхи',
        ms: 'Малайский',
        mt: 'Мальтийский',
        bua: 'Бурятский',
        my: 'Бирманский',
        nl: 'Нидерландский',
        no: 'Норвежский',
        ne: 'Непальский',
        or: 'Ория',
        pa: 'Пенджаби',
        ps: 'Пашто',
        qu: 'Кечуа',
        rm: 'Ретороманский',
        ro: 'Румынский',
        ru: 'Русский',
        rw: 'Киньяруанда',
        sa: 'Санскрит',
        sc: 'Сардский',
        sd: 'Синдхи',
        sg: 'Санго',
        sr: 'Сербский',
        si: 'Сингальский',
        sk: 'Словацкий',
        sl: 'Словенский',
        sm: 'Самоанский',
        sn: 'Шона',
        so: 'Сомалийский',
        sh: 'Сербохорватский',
        st: 'Сесото',
        su: 'Сунданский',
        sv: 'Шведский',
        sw: 'Суахили',
        ta: 'Тамильский',
        te: 'Телугу',
        tg: 'Таджикский',
        th: 'Тайский',
        ti: 'Тигринья',
        tk: 'Туркменский',
        tl: 'Тагальский',
        tn: 'Тсвана',
        to: 'Тонганский',
        tr: 'Турецкий',
        ts: 'Цонга',
        tt: 'Татарский',
        tw: 'Твий',
        ty: 'Тахитянский',
        uk: 'Украинский',
        ur: 'Урду',
        uz: 'Узбекский',
        ve: 'Венда',
        vi: 'Вьетнамский',
        wo: 'Волоф',
        xh: 'Коса',
        yi: 'Идиш',
        yo: 'Йоруба',
        zu: 'Зулусский',
        cs: 'Чешский',
        cz: 'Чешский',
        ua: 'Украинский',
    };

    const getTotalValueByTariff = (
        tariff: 'normal' | 'express' | 'fast',
        toLangInput: string | null
    ): number => {
        const {selectedSamples, fromLanguage, toLanguage, country} = useSampleStore.getState();

        const normalize = (lang: string) =>
            lang.trim().toLowerCase().replace(/[_\s,-]+/g, '');

        const getIsoCode = (lang: string | null): string => {
            if (!lang) return '';
            const normalized = normalize(lang);
            if (langDisplayNameMap[normalized]) return normalized;
            if (toLangMap[normalized]) return toLangMap[normalized];
            const match = Object.entries(langDisplayNameMap).find(
                ([name]) => normalize(name) === normalized
            );
            return match ? match[0] : normalized;
        };

        const from = getIsoCode(fromLanguage);
        const rawTo = getIsoCode(toLangInput || toLanguage);
        const effectiveToLang = (country === 'UA' && from === 'uk' && rawTo === 'ru') ? 'ru' : rawTo;

        if (!effectiveToLang) return 0;

        const getLanguageGroup = (lang: string): string => {
            switch (lang) {
                case 'fr':
                case 'it':
                case 'es':
                    return 'fr_it_es';
                case 'pl':
                case 'cz':
                case 'cs':
                    return 'pl_cz';
                case 'lt':
                case 'pt':
                    return 'lt_pt';
                default:
                    return lang;
            }
        };

        const groupKey = getLanguageGroup(effectiveToLang);
        const normalizedGroupKey = normalize(groupKey);

        let total = 0;


        selectedSamples.forEach((sample) => {
            const foundMatch = sample.languageTariffs?.find(
                (tariffObj) => normalize(tariffObj.language || '') === normalizedGroupKey
            );

            if (foundMatch) {
                const price = foundMatch[tariff] || 0;
                total += price;
            } else {
            }
        });

        return total;
    };

    const normalizedToLang =
        toLangMap[toLanguage?.toLowerCase().trim() || ''] || '';

    const totalPriceNormal = getTotalValueByTariff("normal", normalizedToLang);
    const totalPriceExpress = getTotalValueByTariff("express", normalizedToLang);
    const totalPriceFast = getTotalValueByTariff("fast", normalizedToLang);

    const totalValueByTariff = (tariff: string | null): number => {
        if (!tariff) return 0;

        switch (tariff) {
            case 'Normal':
                return totalPriceNormal;
            case 'Express':
                return totalPriceExpress;
            case 'Fast':
                return totalPriceFast;
            default:
                return 0;
        }
    }


    const handleLanguagePairChange = (from: string | null, to: string | null) => {
        if (from && to && from !== to) {
            const formatted = `${capitalize(from)} - ${capitalize(to)}`;
            setLanguagePair(formatted);
            setLocalLanguagePair(formatted);
        }
    };

    const scrollToSection = () => {
        setTimeout(() => {
            window.scrollTo({top: 0, left: 0, behavior: "smooth"});
        }, 5);
    };

    const handleNextStep = () => {
        setActivePage(activePage + 1);
        scrollToSection();
    };

    const handlePreviousStep = () => {
        setActivePage(activePage - 1);
        scrollToSection();
    };

    const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const handleClosePopup = () => {
        closePopup();
        setActivePage(activePage + 1);
        scrollToSection();
    }

    const selectedDate = useSampleStore(state => state.selectedDate);

    const handleSendData = async (): Promise<{ success: boolean }> => {
        setLoading(true);
        try {
            // функция для цены одного выбранного образца
            const getSamplePrice = (sample: SelectedSample) => {
                const toLangRaw = (toLanguage || "").toLowerCase().trim();
                const normalizedToLang = toLangMap[toLangRaw] || toLangRaw;
                const tariffKey = (tariff?.toLowerCase() || "normal") as "normal" | "express" | "fast";
                const langTariff = sample.languageTariffs?.find(t => {
                    if (!t.language) return false;
                    const lang = t.language.toLowerCase();
                    return lang.includes("_") || lang.includes("-")
                        ? lang.split(/[_\s-]+/).includes(normalizedToLang)
                        : lang === normalizedToLang;
                });
                return langTariff ? (langTariff[tariffKey] || 0) : 0;
            };

            // массив для отправки (лёгкий + цена)
            const samplesForEmail = selectedSamples.map(s => ({
                id: s.id,
                docName: s.docName,
                sampleTitle: s.sampleTitle,
                fioLatin: s.fioLatin || "",
                sealText: s.sealText || "",
                stampText: s.stampText || "",
                computedPrice: getSamplePrice(s),
            }));

            const total =
                (tariff === "Normal") ? totalPriceNormal :
                    (tariff === "Express") ? totalPriceExpress :
                        (tariff === "Fast") ? totalPriceFast : 0;

            const lp = localLanguagePair && localLanguagePair.trim()
                ? localLanguagePair
                : `${fromLanguage || ""} - ${toLanguage || ""}`;

            const formData = new FormData();
            formData.append("email", "dokee.pro@gmail.com");
            formData.append("languagePair", lp);
            formData.append("tariff", tariff || "");
            formData.append("samples", JSON.stringify(samplesForEmail));
            formData.append("totalValue", String(total));
            if (selectedDate) {
                formData.append("selectedDate", selectedDate.locale("ru").format("D MMMM YYYY года"));
            }
            uploadedFiles.forEach((file) => formData.append("files", file, file.name || "file"));

            const {status} = await newRequest.post("/documents/send-data", formData);
            showAlert(status === 200 ? "Данные успешно отправлены на почту" : "Произошла ошибка при отправке данных",
                status === 200 ? "success" : "error");

            if (status === 200) {
                setTimeout(() => window.location.reload(), 1500);
                return {success: true};
            }
            return {success: false};
        } catch (err) {
            showAlert("Произошла ошибка при отправке данных", "error");
            console.error("Error sending data:", err);
            return {success: false};
        } finally {
            setLoading(false);
        }
    };

    const saveFullOrderData: () => Promise<void> = async () => {
        const orderReference = `order_${Date.now()}`;
        const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

        Cookies.set("wayforpay_order_ref", orderReference, {
            expires: 30,
            domain: isLocalhost ? undefined : "dokee.pro",
            secure: !isLocalhost,
        });
        localStorage.setItem("wayforpay_order_ref", orderReference);

        const formData = new FormData();
        formData.append("orderReference", orderReference);
        formData.append("selectedSamples", JSON.stringify(selectedSamples));
        formData.append("fromLanguage", fromLanguage || "");
        formData.append("toLanguage", toLanguage || "");
        formData.append("tariff", tariff || "");
        formData.append("localLanguagePair", localLanguagePair || "");
        formData.append("totalPriceNormal", String(totalPriceNormal));
        formData.append("totalPriceExpress", String(totalPriceExpress));
        formData.append("totalPriceFast", String(totalPriceFast));
        if (selectedDate) formData.append("selectedDate", selectedDate.toISOString());

        uploadedFiles.forEach((file, i) => {
            formData.append("files", file, file.name || `file-${i}`);
        });

        try {
            await newRequest.post("/order/save-order", formData);
        } catch (e) {
            showAlert("Не вдалося зберегти файли. Спробуйте знову.", "error");
            throw e;
        }
    };

    /*dokee.pro@gmail.com*/

    const handleFromLanguageChange = (value: string) => {
        setFromLanguage(value);
        handleLanguagePairChange(value, toLanguage);
        useSampleStore.getState().setFromLanguage(value);
    };

    const getGuaranteeText = () => {
        const dateStr = selectedDate ? selectedDate.locale('ru').format('D MMMM') : null;

        if (tariff === 'Normal') {
            return `(Гарантия доставки до ${dateStr || tomorrowDate} 9:00 (Астаны))`;
        }
        if (tariff === 'Express') {
            return `(Гарантия доставки до ${dateStr || todayDate} 16:00 (Астаны))`;
        }
        if (tariff === 'Fast') {
            return `(Гарантия доставки до ${dateStr || todayDate} ${astanaTimeStr} (Астаны))`;
        }
        return '';
    };

    useEffect(() => {
        if (activeCountry === 'UA') {
            setFromLanguage('украинский');
            setToLanguage('русский');
            handleLanguagePairChange('украинский', 'русский');
            useSampleStore.getState().setFromLanguage('украинский');
            useSampleStore.getState().setToLanguage('русский');
        }
    }, [activeCountry]);

    const kzNow = new Date();
    const todayDate = kzNow.toLocaleDateString('ru-RU', {day: '2-digit', month: 'long'});
    const astanaTime = new Date(kzNow.getTime() + 3 * 60 * 60 * 1000);
    astanaTime.setMinutes(0, 0, 0);
    const astanaTimeStr = astanaTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toLocaleDateString('ru-RU', {day: '2-digit', month: 'long'});

    const handleToLanguageChange = (value: string) => {
        const normalizedLabel = value.trim().toLowerCase();
        const code = toLangMap[normalizedLabel] || normalizedLabel;
        const langDisplayName = langCodeToName[code] || value;
        setToLanguage(value);
        handleLanguagePairChange(fromLanguage, langDisplayName);
        useSampleStore.getState().setToLanguage(code);
    };

    const handleTariffSelect = (selectedTariff: string) => {
        setTariff(selectedTariff);
        useSampleStore.getState().setSelectedTariff(selectedTariff);
    };

    const getKazakhstanTime = () => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        return new Date(utc + 5 * 60 * 60000);
    };

    const isOutsideInterval = (startHour: number, endHour: number): boolean => {
        const time = getKazakhstanTime();
        const hour = time.getHours();

        if (startHour < endHour) {
            return hour < startHour || hour >= endHour;
        } else {
            return hour < startHour && hour >= endHour;
        }
    };

    const isExpressDisabled = (activeCountry === 'KZ' || activeCountry === 'UA') && isOutsideInterval(0, 0);
    const isFastDisabled = (activeCountry === 'KZ' || activeCountry === 'UA') && isOutsideInterval(8, 16);
    const isNormalDisabled = (activeCountry === 'KZ' || activeCountry === 'UA') && isOutsideInterval(8, 21);

    const allAvailableToLanguages: string[] = Array.from(
        new Set(
            selectedSamples.flatMap(sample =>
                sample.languageTariffs?.flatMap(t =>
                    t.language
                        ?.toLowerCase()
                        .split(/[_\s,-]+/)
                        .filter((code) => !!langDisplayNameMap[code] && code !== fromLanguage?.toLowerCase())
                ) || []
            )
        )
    );
    const areAllTariffsDisabled = isNormalDisabled && isExpressDisabled && isFastDisabled;

    const predefinedLangCodes = [
        "ru",
        "en",
        "uk",
        "pl",
        "pt",
        "fr",
        "lt",
        "de",
        "it",
        "es",
        "cs",
        "cz"
    ];

    const additionalToLanguages = allAvailableToLanguages.filter(
        (code) => !predefinedLangCodes.includes(code)
    );

    const renderPopupContent = (title: string) => {
        switch (title) {
            case 'Печать':
                return (
                    <div className={styles.popupContent}>
                        <div className={styles.column}>
                            <h3>Пример печати</h3>
                            <Image src={sealExample} alt="image" width={281} height={211}/>
                        </div>
                        <div className={styles.column}>
                            <h3>Пример расшифровки</h3>
                            <p>Республика Казахстан Лицензия № 0000000 выдана 00 июня 0000 года Комитетом по
                                организации правовой помощи и оказанию юридических услуг населению МЮ РК Частный
                                нотариус</p>
                        </div>
                    </div>
                );
            case 'Штамп':
                return (
                    <div className={styles.popupContent}>
                        <button className={styles.buttonSendData} onClick={handleSendData}>Оплатить</button>
                        <div className={styles.column}>
                            <h3>Пример штампа</h3>
                            <Image src={stampExample} alt="image" width={281} height={211}/>
                        </div>
                        <div className={styles.column}>
                            <h3>Пример расшифровки</h3>
                            <p>Экибастузское городское отделение регистрации кадастра Павлодарский областной филиал
                                Коммерческого акционерного общества Государственной корпорации «Правительство для
                                граждан» ИЗМЕНЕНИЯ И ДОПОЛНЕНИЯ БСН 000940000220 №
                                346, 472-195-16-АК Первоначальная дата регистрации &quot;09&quot; октября 2020 г.</p>
                        </div>
                    </div>
                );
            case 'Предупреждение':
                return (
                    <div className={styles.popupContentWarning}>
                        <Image src={warningExample} alt="image" width={136} height={136}/>
                        <div className={styles.texts}>
                            <h3>Обращаем внимание</h3>
                            <p>При условии не заполнения данной информации, Вы согласны с тем, что ФИО будут переведены
                                по правилам транслитерации, а печати и штампы отображены в виде текста
                                на языке перевода:
                                (Печать нечитабельна) или (Штамп нечитабельный)</p>
                        </div>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}}
                                        onClick={handleClosePopup}>
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            default:
                return null;
        }
    }

    useEffect(() => {
        const orderData = {
            selectedSamples,
            fromLanguage,
            toLanguage,
            selectedTariff: tariff,
            selectedDate: selectedDate ? selectedDate.toISOString() : null,
            uploadedFiles: uploadedFiles.map(f => ({
                name: f.name,
                type: f.type,
                size: f.size,
            })),
        };
        Cookies.set("wayforpay_order_data", JSON.stringify(orderData), {expires: 1});
    }, [selectedSamples, fromLanguage, toLanguage, tariff, selectedDate, uploadedFiles]);

    const renderContent = () => {
        switch (activePage) {
            case 1:
                return <>
                    {currentDoc ? (
                        <div className={styles.documentsContent}>
                            {(currentDoc.samples ?? []).map((sample: Sample, index: number) => (
                                <DocumentItem
                                    key={index}
                                    title={sample.title}
                                    img={sample.imageUrl || sample.image}
                                    selected={isSampleSelected(`${currentDoc.name}-${sample.title}`)}
                                    onSelect={() => handleSampleSelect(sample)}
                                    onDeselect={() => handleSampleDeselect(sample)}
                                    mode="sample"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.documentsContent}>
                            {documentLoader
                                ? Array.from({length: 16}).map((_, idx) => (
                                    <Skeleton
                                        key={idx}
                                        variant="rectangular"
                                        width="100%"
                                        height={74}
                                        style={{marginBottom: 16, borderRadius: 12}}
                                    />
                                ))
                                : documents
                                    .filter(doc => doc.documentCountry === activeCountry.toLowerCase())
                                    .map((doc, index) => {
                                        const selectedVariants = selectedSamples.filter(s => s.docName === doc.name).length;
                                        const isSelected = selectedVariants > 0;

                                        return (
                                            <DocumentItem
                                                key={doc._id || index}
                                                title={doc.name}
                                                selectedVariants={isSelected ? selectedVariants : undefined}
                                                selected={isSelected}
                                                onSelect={() => handleDocumentSelect(doc.name, false)}
                                                onDeselect={() => handleDocumentSelect(doc.name, true)}
                                            />
                                        );
                                    })}
                        </div>
                    )}
                    {/*{selectedSamples.length > 0 && (
                        <div className={styles.selectedSummary}>
                            <h4>Выбранные образцы:</h4>
                            <ul>
                                {selectedSamples.map((sample) => (
                                    <li key={sample.id}>
                                        <strong>{sample.docName}</strong> — {sample.sampleTitle}
                                        <ul style={{ marginTop: '4px', marginLeft: '12px', fontSize: '14px', color: '#555' }}>
                                            {sample.languageTariffs.map((tariff, i) => (
                                                <li key={i}>
                                                    <strong>{tariff.language.toUpperCase()}</strong>:
                                                    🕓 Normal — {tariff.normal}₸, 🚀 Express — {tariff.express}₸, ⚡ Fast — {tariff.fast}₸
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}*/}
                </>;
            case 2:
                return (
                    <div className={styles.tariffAndLanguage}>
                        <div className={styles.languagePair}>
                            <p>Выберите языковую пару для документа</p>
                            <div className={styles.selectors}>
                                <Select
                                    value={fromLanguage}
                                    onChange={(_, value) => handleFromLanguageChange(value || "")}
                                    sx={{width: "100%"}}
                                    disabled={activeCountry === 'UA'}
                                >
                                    <Option value="русский">Русский</Option>
                                    {activeCountry !== 'KZ' && (
                                        <Option value="украинский">Украинский</Option>
                                    )}
                                </Select>
                                <HiMiniArrowsRightLeft size={50}/>
                                <Select
                                    value={toLanguage}
                                    onChange={(_, value) => handleToLanguageChange(value || "")}
                                    sx={{width: "100%"}}
                                    disabled={activeCountry === 'UA'}
                                >
                                    {[
                                        {value: "английский", label: "Английский"},
                                        {value: "испанский", label: "Испанский"},
                                        {value: "итальянский", label: "Итальянский"},
                                        {value: "литовский", label: "Литовский"},
                                        {value: "немецкий", label: "Немецкий"},
                                        {value: "польский", label: "Польский"},
                                        {value: "португальский", label: "Португальский"},
                                        {value: "украинский", label: "Украинский"},
                                        {value: "русский", label: "Русский"},
                                        {value: "французский", label: "Французский"},
                                        {value: "чешский", label: "Чешский"},
                                    ]
                                        .filter(lang => !(activeCountry === 'KZ' && lang.value === "русский"))
                                        .sort((a, b) => a.label.localeCompare(b.label, 'ru'))
                                        .map(lang => (
                                            <Option
                                                key={lang.value}
                                                value={lang.value}
                                                disabled={fromLanguage === lang.value}
                                            >
                                                {lang.label}
                                            </Option>
                                        ))}

                                    {additionalToLanguages
                                        .filter(code => !(activeCountry === 'KZ' && code === 'ru'))
                                        .sort((a, b) =>
                                            (langDisplayNameMap[a] || a).localeCompare(langDisplayNameMap[b] || b, 'ru')
                                        )
                                        .map(code => (
                                            <Option
                                                key={code}
                                                value={code}
                                                disabled={fromLanguage?.toLowerCase() === code}
                                            >
                                                {langDisplayNameMap[code]}
                                            </Option>
                                        ))}
                                </Select>
                            </div>
                            <p style={{color: "red"}}>{fromLanguage === toLanguage ? "Языковая пара не может быть одинаковой" : ""}</p>
                        </div>
                        <div
                            className={styles.tariffs}
                            ref={tariffsRef}
                            onScroll={handleTariffsScroll}
                            style={{overflowX: 'auto', display: 'flex'}}>
                            <TariffItem
                                title="Normal"
                                description="Перевод документов завтра на утро"
                                benefits={[
                                    {iconSrc: timeIcon, text: `Гарантия доставки до ${tomorrowDate} 9:00 (Астаны)`},
                                    {iconSrc: garry, text: 'Обычная скорость перевода'},
                                    {iconSrc: discount, text: 'на 15% дешевле средней цены на рынке'},
                                ]}
                                price={totalPriceNormal}
                                availableSlots={
                                    activeCountry === 'KZ'
                                        ? general?.kzNormalSlots ?? 0
                                        : general?.uaNormalSlots ?? 0
                                }
                                borderRadius={['30px', '0', '0', '30px']}
                                onSelect={() => handleTariffSelect('Normal')}
                                isSelected={tariff === 'Normal'}
                                selectedTariff={tariff || ""}
                                disabled={isNormalDisabled}
                            />
                            <TariffItem
                                title="Express"
                                description="Перевод документов в тот же день"
                                benefits={[
                                    {iconSrc: timeIconPurple, text: `Гарантия доставки до ${todayDate} 16:00 (Астаны)`},
                                    {iconSrc: fast, text: 'Ускоряемся для быстрого перевода'},
                                    {iconSrc: discountPurple, text: 'на 25% дешевле средней цены на рынке'},
                                ]}
                                price={totalPriceExpress}
                                availableSlots={
                                    activeCountry === 'KZ'
                                        ? general?.kzExpressSlots ?? 0
                                        : general?.uaExpressSlots ?? 0
                                }
                                borderRadius={['0', '0', '0', '0']}
                                onSelect={() => handleTariffSelect('Express')}
                                isSelected={tariff === 'Express'}
                                selectedTariff={tariff || ""}
                                disabled={isExpressDisabled}
                            />
                            <TariffItem
                                title="Fast"
                                description="Перевод документов за 2-3 часа"
                                availableSlots={
                                    activeCountry === 'KZ'
                                        ? general?.kzFastSlots ?? 0
                                        : general?.uaFastSlots ?? 0
                                }
                                benefits={[
                                    {
                                        iconSrc: timeIconWhite,
                                        text: `Гарантия доставки до ${todayDate} ${astanaTimeStr} (Астаны)`
                                    },
                                    {iconSrc: lightning, text: 'Молниеносный перевод'},
                                    {iconSrc: discountWhite, text: 'на 35% дешевле средней цены на рынке'},
                                ]}
                                price={totalPriceFast}
                                borderRadius={['0', '30px', '30px', '0']}
                                onSelect={() => handleTariffSelect('Fast')}
                                isSelected={tariff === 'Fast'}
                                selectedTariff={tariff || ""}
                                disabled={isFastDisabled}
                            />
                        </div>
                        <div className={styles.mobileOnly} style={{margin: "5px auto", fontSize: "20px"}}>
                            <span style={{color: '#000', fontWeight: 600}}>{tariffStep}/</span>
                            <span style={{color: '#bdbdbd', fontWeight: 600}}>3</span>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div
                        className={styles.dropFile}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {/*<p className={styles.fileSizeCounter}>
                            Загальний розмір файлів: <strong>{totalFileSizeMB} MB</strong> / 15 MB
                        </p>*/}
                        <Image src={dropFile} alt="file" width={120} height={120}/>
                        <h5>ПРЕДОСТАВЬТЕ КАЧЕСТВЕННУЮ СКАН-КОПИЮ ИЛИ ФОТО ДОКУМЕНТОВ ДЛЯ ПЕРЕВОДА</h5>
                        <h4>
                            Обращаем Ваше внимание, что в случае предоставления некачественных изображений оригинала
                            документа, Вы соглашаетесь с тем, что будет переведена лишь та часть, которая будет
                            отчетливо видна. Расшифровку печатей и штампов Вы сможете предоставить на следующем шаге.
                        </h4>
                        <label
                            style={{
                                cursor: 'pointer',
                                color: '#565add',
                                textDecoration: 'underline',
                            }}
                        >
                            {isMobileView ? (
                                <p>
                                    <span>Загрузите</span> файлы в это окно
                                </p>
                            ) : (
                                <p>
                                    Перетяните или <span>загрузите</span> файлы в это окно
                                </p>
                            )}
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileInput}
                                style={{display: 'none'}}
                            />
                        </label>
                        {isFileSizeExceeded && (
                            <p className={styles.warning}>
                                Максимально допустимый размер вложений — 15 МБ. Если файлов больше, отправляйте их как
                                скан-копии в формате PDF.
                            </p>
                        )}
                        {uploadedFiles.length > 0 && (
                            <ul className={styles.uploadedList}>
                                {uploadedFiles.map((file, index) => (
                                    <li
                                        key={index}
                                        style={{display: 'flex', alignItems: 'center', gap: 8}}
                                    >
                                        {index + 1}. {file.name}
                                        <IconButton
                                            size="small"
                                            sx={{
                                                marginLeft: 1,
                                                color: '#fff',
                                                backgroundColor: '#f44336',
                                                '&:hover': {backgroundColor: '#d32f2f'},
                                                width: 24,
                                                height: 24,
                                            }}
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <TiTimes size={16}/>
                                        </IconButton>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className={styles.accordionWrapper}>
                        {selectedSamples.map((sample, idx) => (
                            <Accordion
                                key={`${sample.docName}-${sample.sampleTitle}-${idx}`}
                                expanded={idx === 0 ? true : undefined}
                                sx={{
                                    boxShadow: 'none',
                                    borderBottom: '1px solid #cccccc',
                                    padding: '10px 0',
                                }}>
                                <AccordionSummary expandIcon={<IoIosArrowDown/>}>
                                    <h2 className={styles.accordionTitle}>
                                        Данные для{' '}
                                        <span
                                            style={{color: '#565add'}}>{sample.docName.replace(/\s*\(.*?\)/, '')}</span>
                                        {sample.sampleTitle && <> — <span>{sample.sampleTitle}</span></>}
                                    </h2>
                                </AccordionSummary>
                                <AccordionDetails className={styles.accordionDetails}>
                                    <div className={styles.inputWrapper}>
                                        <p>ФИО латиницей</p>
                                        <Input
                                            value={sample.fioLatin || ''}
                                            onChange={e => setSampleField(sample.id, 'fioLatin', e.target.value)}
                                            fullWidth
                                            placeholder="Фамилия Имя Отчество"
                                            sx={{mb: 2}}
                                        />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <p>
                                            Печать
                                            <Tooltip title="Что означает?">
                                                <BsFillInfoSquareFill
                                                    className={styles.icon}
                                                    onClick={() => handleOpenPopup(renderPopupContent('Печать'))}
                                                />
                                            </Tooltip>
                                        </p>
                                        <Input
                                            value={sample.sealText || ''}
                                            onChange={e => setSampleField(sample.id, 'sealText', e.target.value)}
                                            fullWidth
                                            placeholder="Рассшифровка печати"
                                            sx={{mb: 2}}
                                        />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <p onClick={() => handleOpenPopup(renderPopupContent('Штамп'))}>
                                            Штамп
                                            <Tooltip title="Что означает?">
                                                <BsFillInfoSquareFill className={styles.icon}/>
                                            </Tooltip>
                                        </p>
                                        <Input
                                            value={sample.stampText || ''}
                                            onChange={e => setSampleField(sample.id, 'stampText', e.target.value)}
                                            fullWidth
                                            placeholder="Рассшифровка штампа"
                                        />
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </div>
                );
            case 5:
                return (
                    <div className={styles.finalDocuments}>
                        {selectedSamples.map((sample) => {
                            const baseName = sample.docName.replace(/\s*\(.*?\)/, '');
                            const fullName = `${baseName}${sample.sampleTitle ? ` (${sample.sampleTitle})` : ''}`;

                            const getSamplePrice = (sample: SelectedSample) => {
                                const toLangRaw = toLanguage?.toLowerCase() || '';
                                const normalizedToLang = toLangMap[toLangRaw] || toLangRaw;
                                const tariffKey = (tariff?.toLowerCase() || 'normal') as 'normal' | 'express' | 'fast';
                                const langTariff = sample.languageTariffs.find(t => {
                                    if (!t.language) return false;
                                    const lang = t.language.toLowerCase();

                                    if (lang.includes('_') || lang.includes('-')) {
                                        return lang.split(/[_\s-]+/).includes(normalizedToLang);
                                    }

                                    return lang === normalizedToLang;
                                });
                                return langTariff ? langTariff[tariffKey] || 0 : 0;
                            };
                            return (
                                <DocumentFinalItem
                                    key={sample.id}
                                    documentName={baseName}
                                    documentFullName={fullName}
                                    tariff={tariff ? `${tariff} ${getGuaranteeText()}` : ''}
                                    languagePair={localLanguagePair || ''}
                                    documentPrice={getSamplePrice(sample)}
                                />
                            );
                        })}
                    </div>
                );
            default:
                return <p>Invalid page.</p>;
        }
    };

    const handleBackToList = () => {
        setCurrentDoc(null);
        scrollToSection()
    };

    const nextButtonStyle = {
        backgroundColor: isNextDisabled() ? '#f0f0f0' : '#565add',
        color: isNextDisabled() ? '#aaa' : '#fff',
        border: '2px solid',
        borderColor: isNextDisabled() ? '#ddd' : '#b1b4f1',
        cursor: isNextDisabled() ? 'not-allowed' : 'pointer',
        '&:hover': {
            backgroundColor: isNextDisabled() ? '#f0f0f0' : '#4040c4',
        },
    };

    const areAllSampleFieldsFilled = selectedSamples.every(
        sample =>
            sample.fioLatin?.trim() &&
            sample.sealText?.trim() &&
            sample.stampText?.trim()
    );

    const renderButtons = () => {
        switch (activePage) {
            case 1:
                return (
                    <div className={styles.documentNavigation}>
                        {currentDoc && (
                            <ButtonOutlined
                                outlined
                                sx={{borderColor: "1px solid #d6e0ec"}}
                                onClick={handleBackToList}
                            >
                                {selectedSamples.length === 0 ? "Назад" : "Выбрать ещё"}
                            </ButtonOutlined>
                        )}
                        <ButtonOutlined
                            onClick={handleNextStep}
                            disabled={selectedSamples.length === 0}
                            sx={nextButtonStyle}>
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}} onClick={handlePreviousStep}>
                            Назад
                        </ButtonOutlined>

                        <ButtonOutlined
                            sx={nextButtonStyle}
                            onClick={handleNextStep}
                            disabled={isNextDisabled()}
                        >
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}} onClick={handlePreviousStep}>
                            Назад
                        </ButtonOutlined>
                        <ButtonOutlined
                            sx={nextButtonStyle}
                            onClick={handleNextStep}
                            disabled={!isPage3Valid || isFileSizeExceeded}
                        >
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 4:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}} onClick={handlePreviousStep}>
                            Назад
                        </ButtonOutlined>
                        <ButtonOutlined
                            onClick={() => {
                                if (areAllSampleFieldsFilled) {
                                    handleNextStep();
                                } else {
                                    handleOpenPopup(renderPopupContent('Предупреждение'));
                                }
                            }}
                            disabled={isNextDisabled()}
                            sx={nextButtonStyle}
                        >
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 5:
                return (
                    <div className={styles.buttonsFlexText}>
                        <p>
                            Вы соглашаетесь получать новостные сообщения, их будет мало и редко!
                        </p>
                        <div className={styles.buttonsFlex}>
                            <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}}
                                            onClick={handlePreviousStep}>
                                Назад
                            </ButtonOutlined>
                            <WayforpayRedirectButton
                                loading={loading}
                                onBeforeRedirect={saveFullOrderData}
                                products={selectedSamples.map(s => {
                                    const toLangRaw = toLanguage?.toLowerCase() || '';
                                    const normalizedToLang = toLangMap[toLangRaw] || toLangRaw;
                                    const tariffKey = (tariff?.toLowerCase() || 'normal') as 'normal' | 'express' | 'fast';
                                    const langTariff = s.languageTariffs.find(t => {
                                        if (!t.language) return false;
                                        const lang = t.language.toLowerCase();
                                        if (lang.includes('_') || lang.includes('-')) {
                                            return lang.split(/[_\s-]+/).includes(normalizedToLang);
                                        }
                                        return lang === normalizedToLang;
                                    });
                                    const price = langTariff ? langTariff[tariffKey] || 0 : 0;
                                    const baseName = s.docName.replace(/\s*\(.*?\)/, '');
                                    const fullName = `${baseName}${s.sampleTitle ? ` (${s.sampleTitle})` : ''} - ${price}₸`;
                                    return {
                                        sampleTitle: fullName,
                                        price,
                                        count: 1,
                                    };
                                })}
                                totalValue={totalValueByTariff(tariff)}
                                currency="KZT"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    const renderTitle = () => {
        switch (activePage) {
            case 1:
                return <>
                    {currentDoc ?
                        <div>
                            <h2>Выберите <span>образец</span> документа</h2>
                            <p>Обращаем внимание, что в случае выбора образца, Вам необходимо будет загрузить документ,
                                который ему соответствует. В противном случае документ не будет переведен, а денежные
                                средства будут возвращены Вам на счет согласно условий Возврата денежных средств</p>
                        </div>
                        :
                        <h2>Выберите <span>тип</span> документа</h2>}</>;
            case 2:
                return <h2>Выберите <span>язык и подходящий тариф</span></h2>;
            case 3:
                return <h2>Загрузите <span>файл</span></h2>;
            case 4:
                return <div className={styles.infoP}>
                    <h2>Введите <span>данные из документов</span></h2>
                    <p>Мы сможем гарантировать точный и полный перевод, при условии предоставления ФИО латиницей, а
                        также расшифровки печатей и штампов на русском языке</p>
                </div>
            case 5:
                return <h2>Общая стоимость: <span>{totalValueByTariff(tariff)} ₸</span></h2>;
            default:
                return null;
        }
    }

    const handleCountrySwitch = (country: 'KZ' | 'UA') => {
        clearAll();
        setActiveCountry(country);
        useSampleStore.getState().setCountry(country);
    };
    return (
        <div className={styles.wrapper} id="calculator">
            <div className={styles.toggles}>
                <Button
                    onClick={() => handleCountrySwitch('KZ')}
                    disabled={activePage >= 2 || !!currentDoc}
                    sx={{
                        borderRadius: "10px 0 0 0",
                        backgroundColor: activeCountry === 'KZ' ? '#565add' : '#eff0ff',
                        color: activeCountry === 'KZ' ? '#fff' : '#000',
                        textTransform: "none",
                        gap: "7px",
                        fontSize: "16px",
                        padding: "14px 27px",
                        ...(activeCountry === 'KZ' && (activePage >= 2 || !!currentDoc)
                            ? {
                                '&.Mui-disabled': {
                                    backgroundColor: '#565add',
                                    color: '#fff',
                                    opacity: 1,
                                }
                            }
                            : {}),
                        '&:hover': {
                            backgroundColor: '#565add',
                            color: '#fff',
                        },
                    }}>
                    <Image src={kzFlag} alt="kz" width={16} height={16}/>
                    Казахстан
                </Button>
                <Button
                    onClick={() => handleCountrySwitch('UA')}
                    disabled={activePage >= 2 || !!currentDoc}
                    sx={{
                        borderRadius: "0 10px 0 0",
                        backgroundColor: activeCountry === 'UA' ? '#565add' : '#eff0ff',
                        color: activeCountry === 'UA' ? '#fff' : '#000',
                        textTransform: "none",
                        gap: "7px",
                        padding: "14px 27px",
                        fontSize: "16px",
                        ...(activeCountry === 'UA' && (activePage >= 2 || !!currentDoc)
                            ? {
                                '&.Mui-disabled': {
                                    backgroundColor: '#565add',
                                    color: '#fff',
                                    opacity: 1,
                                }
                            }
                            : {}),
                        '&:hover': {
                            backgroundColor: '#565add',
                            color: '#fff',
                        },
                    }}>
                    <Image src={uaFlag} alt="ua" width={16} height={16}/>
                    Украина
                </Button>
            </div>
            <div className={styles.documents}>
                <div className={styles.documentsHeader}>
                    {renderTitle()}
                    <div className={styles.pagination}>
                        {[1, 2, 3, 4, 5].map((number) => (
                            <Button
                                key={number}
                                onClick={() => setActivePage(number)}
                                disabled={activePage !== number}
                                sx={{
                                    minWidth: '40px',
                                    height: '40px',
                                    margin: '0 5px',
                                    backgroundColor: activePage === number ? '#565add' : '#eff0ff',
                                    color: activePage === number ? '#fff' : '#7f7f7f',
                                    border: '1px solid #d6e0ec',
                                    textTransform: 'none',
                                    fontSize: '14px',
                                    width: isMobileView ? '26px' : '57px',
                                    borderRadius: '10px',
                                    '&:hover': {
                                        backgroundColor: activePage === number ? '#565add' : '#eff0ff',
                                        color: activePage === number ? '#fff' : '#7f7f7f',
                                    },
                                }}>
                                {number}
                            </Button>
                        ))}
                    </div>
                </div>
                {renderContent()}
                <div className={styles.documentNavigation}>
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

export default TypeOfDocument;