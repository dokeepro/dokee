"use client";

import React, {useEffect, useRef, useState} from 'react';
import styles from "./TypeOfDocument.module.scss";
import {Accordion, AccordionDetails, AccordionSummary, Button, Tooltip, useMediaQuery} from "@mui/material";
import uaFlag from "@/assets/icons/ua-icon.png";
import kzFlag from "@/assets/icons/kz-icon.png";
import Image from "next/image";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import DocumentItem from "@/components/document-item/DocumentItem";
import {SelectedSample, useSampleStore} from '@/store/sampleStore';
import {Select, Option} from '@mui/joy';
import {Input} from '@mui/joy';
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
import { newRequest } from '@/utils/newRequest';
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
    languageTariffs?: LanguageTariff[]; // Make optional
    imageUrl?: string;
    image?: string;
}

interface Document {
    name: string;
    documentCountry?: string;
    languageTariffs?: LanguageTariff[]; // Make optional
    samples: Sample[];
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
}

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

    const { showAlert } = useAlert();


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
    const {documents, general} = useGeneral();
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



    const [currentDoc, setCurrentDoc] = useState<Document | null>(null);

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


    const handleRemoveFile = (index: number) => {
        removeUploadedFile(index);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        addUploadedFiles(files);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        addUploadedFiles(files);
    };

    const isNextDisabled = () => {
        switch (activePage) {
            case 1:
                return !isPage1Valid;
            case 2:
                return !isPage2Valid;
            case 3:
                return !isPage3Valid;
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
    };

    type TariffType = 'normal' | 'express' | 'fast';

    const getTotalValueByTariff = (
        tariff: TariffType,
        toLang: string | null
    ): number => {
        const { selectedSamples, country, fromLanguage, toLanguage } = useSampleStore.getState();

        const normalize = (lang: string) =>
            lang.trim().toLowerCase().replace(/[_\s-]+/g, '');

        let effectiveToLang = '';
        const from = normalize(fromLanguage || '');
        const to = normalize(toLanguage || '');

        if (country === 'UA' && from === 'украинский' && to === 'русский') {
            effectiveToLang = 'ru';
        } else {
            effectiveToLang = toLang ? normalize(toLang) : '';
        }

        if (!effectiveToLang) return 0;

        return selectedSamples.reduce((total, sample) => {
            const matchingTariff = sample.languageTariffs.find((t) => {
                if (!t.language) return false;
                const langs = t.language
                    .toLowerCase()
                    .split(/[_-]/)
                    .map((l: string) => l.trim());
                return langs.includes(effectiveToLang);
            });

            const price = matchingTariff?.[tariff] ?? 0;
            return total + price;
        }, 0);
    };

    const normalizedToLang = toLangMap[toLanguage?.toLowerCase() || ''] || '';

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
        window.scrollTo({ top: 0, behavior: "smooth" });
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
    }

    const selectedDate = useSampleStore(state => state.selectedDate);

    const handleSendData = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', 'bobuskiy.olexandr@gmail.com');
            formData.append('languagePair', localLanguagePair || "");
            formData.append('tariff', tariff || '');
            formData.append('samples', JSON.stringify(selectedSamples));
            formData.append('totalValue', totalValueByTariff(tariff).toString());
            if (selectedDate) {
                formData.append('selectedDate', selectedDate.format('YYYY-MM-DD'));
            }
            uploadedFiles.forEach((file) => {
                formData.append('files', file);
            });
            await newRequest.post('/documents/send-data', formData);
            showAlert('Данные успешно отправлены на почту', 'success');
        } catch (err) {
            showAlert('Произошла ошибка при отправке данных', 'error');
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const handleFromLanguageChange = (value: string) => {
        setFromLanguage(value);
        handleLanguagePairChange(value, toLanguage);
    };

    const getGuaranteeText = () => {
        if (tariff === 'Normal') {
            return `  (Гарантия доставки до ${tomorrowDate} 9:00 (Астаны))`;
        }
        if (tariff === 'Express') {
            return `  (Гарантия доставки до ${todayDate} 21:00 (Астаны))`;
        }
        if (tariff === 'Fast') {
            return `  (Гарантия доставки до ${todayDate} ${astanaTimeStr} (Астаны))`;
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

    const now = new Date();
    const todayDate = now.toLocaleDateString('ru-RU', {day: '2-digit', month: 'long'});
    const astanaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    astanaTime.setMinutes(0, 0, 0);
    const astanaTimeStr = astanaTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toLocaleDateString('ru-RU', {day: '2-digit', month: 'long'});
    const handleToLanguageChange = (value: string) => {
        setToLanguage(value);
        handleLanguagePairChange(fromLanguage, value);
    };
    const handleTariffSelect = (selectedTariff: string) => {
        setTariff(selectedTariff);
    };

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
    const renderContent = () => {
        switch (activePage) {
            case 1:
                return <>
                    {currentDoc ? (
                        <div className={styles.documentsContent}>
                            {currentDoc.samples.map((sample: Sample, index: number) => (
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
                            {documents
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
                    {selectedSamples.length > 0 && (
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
                    )}
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
                                    <Option value="украинский">Украинский</Option>
                                </Select>
                                <HiMiniArrowsRightLeft size={50}/>
                                <Select
                                    value={toLanguage}
                                    onChange={(_, value) => handleToLanguageChange(value || "")}
                                    sx={{width: "100%"}}
                                    disabled={activeCountry === 'UA'}
                                >
                                    <Option value="русский" disabled={fromLanguage === "русский"}>Русский</Option>
                                    <Option value="английский"
                                            disabled={fromLanguage === "английский"}>Английский</Option>
                                    <Option value="украинский"
                                            disabled={fromLanguage === "украинский"}>Украинский</Option>
                                    <Option value="польский" disabled={fromLanguage === "польский"}>Польский</Option>
                                    <Option value="португальский"
                                            disabled={fromLanguage === "португальский"}>Португальский</Option>
                                    <Option value="французский"
                                            disabled={fromLanguage === "французский"}>Французский</Option>
                                    <Option value="литовский" disabled={fromLanguage === "литовский"}>Литовский</Option>
                                    <Option value="немецкий" disabled={fromLanguage === "немецкий"}>Немецкий</Option>
                                    <Option value="итальянский"
                                            disabled={fromLanguage === "итальянский"}>Итальянский</Option>
                                    <Option value="испанский" disabled={fromLanguage === "испанский"}>Испанский</Option>
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
                                availableSlots={general?.normalSlots ?? 0}
                                borderRadius={['30px', '0', '0', '30px']}
                                onSelect={() => handleTariffSelect('Normal')}
                                isSelected={tariff === 'Normal'}
                                selectedTariff={tariff || ""}
                            />
                            <TariffItem
                                title="Express"
                                description="Перевод документов в тот же день"
                                benefits={[
                                    {iconSrc: timeIconPurple, text: `Гарантия доставки до ${todayDate} 21:00 (Астаны)`},
                                    {iconSrc: fast, text: 'Ускоряемся для быстрого перевода'},
                                    {iconSrc: discountPurple, text: 'на 25% дешевле средней цены на рынке'},
                                ]}
                                price={totalPriceExpress}
                                availableSlots={general?.expressSlots ?? 0}
                                borderRadius={['0', '0', '0', '0']}
                                onSelect={() => handleTariffSelect('Express')}
                                isSelected={tariff === 'Express'}
                                selectedTariff={tariff || ""}
                            />
                            <TariffItem
                                title="Fast"
                                description="Перевод документов за 2-3 часа"
                                availableSlots={general?.fastSlots ?? 0}
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
                                onChange={handleFileInput}
                                style={{display: 'none'}}
                            />
                        </label>

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
                            <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}} onClick={handleBackToList}>
                                Выбрать ещё
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
                        <ButtonOutlined sx={nextButtonStyle} onClick={handleNextStep} disabled={isNextDisabled()}>
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
                        <ButtonOutlined sx={nextButtonStyle} onClick={handleNextStep} disabled={isNextDisabled()}>
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
                            <ButtonOutlined onClick={handleSendData}>
                                {loading ? 'Обработка...' : 'Перейти к оплате'}
                            </ButtonOutlined>
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
                    disabled={activePage >= 2}
                    sx={{
                        borderRadius: "10px 0 0 0",
                        backgroundColor: activeCountry === 'KZ' ? '#565add' : '#eff0ff',
                        color: activeCountry === 'KZ' ? '#fff' : '#000',
                        textTransform: "none",
                        gap: "7px",
                        fontSize: "16px",
                        padding: "14px 27px",
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
                    disabled={activePage >= 2}
                    sx={{
                        borderRadius: "0 10px 0 0",
                        backgroundColor: activeCountry === 'UA' ? '#565add' : '#eff0ff',
                        color: activeCountry === 'UA' ? '#fff' : '#000',
                        textTransform: "none",
                        gap: "7px",
                        padding: "14px 27px",
                        fontSize: "16px",
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