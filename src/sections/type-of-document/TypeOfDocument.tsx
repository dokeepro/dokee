"use client";

import React, {useState} from 'react';
import styles from "./TypeOfDocument.module.scss";
import {Accordion, AccordionDetails, AccordionSummary, Button, useMediaQuery} from "@mui/material";
import uaFlag from "@/assets/icons/ua-icon.png";
import kzFlag from "@/assets/icons/kz-icon.png";
import Image from "next/image";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import DocumentItem from "@/components/document-item/DocumentItem";
import documentTypes from "@/constants/documentTypes";
import {Select, Option} from '@mui/joy';
import {Input} from '@mui/joy';
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
import {HiMiniArrowsRightLeft} from "react-icons/hi2";
import TariffItem from '@/components/tariff-item/TariffItem';
import {useDocumentContext} from "@/context/DocumentContext";
import {IoIosArrowDown} from "react-icons/io";
import md5 from 'blueimp-md5';
import DocumentFinalItem from '@/components/document-final-item/DocumentFinalItem';

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

const TypeOfDocument = () => {

    const [activePage, setActivePage] = useState(1);
    const [activeCountry, setActiveCountry] = useState<'KZ' | 'UA'>('KZ');
    const isMobileView = useMediaQuery('(max-width:768px)');
    const {addDocument, selectedDocuments, setLanguagePair, setTariff, tariff} = useDocumentContext();
    const [fromLanguage, setFromLanguage] = useState<string | null>("русский");
    const [toLanguage, setToLanguage] = useState<string | null>("польский");

    const totalValue = selectedDocuments.reduce((total) => {
        switch (tariff) {
            case 'Normal':
                return total + 499;
            case 'Express':
                return total + 699;
            case 'Fast':
                return total + 899;
            default:
                return total;
        }
    }, 0);

    const handleLanguagePairChange = (from: string | null, to: string | null) => {
        if (from && to) {
            setLanguagePair({from, to});
        }
    };

    const handlePay = () => {
        const merchantAccount = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_ACCOUNT;
        const merchantSecretKey = process.env.NEXT_PUBLIC_WAYFORPAY_MERCHANT_SECRET;
        const merchantDomainName = process.env.NEXT_PUBLIC_WAYFORPAY_DOMAIN;

        // Check if running in development
        const isDevelopment = process.env.NODE_ENV === 'development';
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

        if (isDevelopment || currentHost === 'localhost') {
            alert('WayForPay payments cannot be processed on localhost. Please deploy to a production environment with a valid domain name.');
            console.error('WayForPay payments are not available in development mode');
            return;
        }

        if (!merchantAccount || !merchantSecretKey || !merchantDomainName) {
            alert('Payment configuration is missing. Please check your environment variables.');
            console.error('WayForPay configuration is missing');
            return;
        }

        // Validate domain
        if (currentHost !== merchantDomainName) {
            alert(`Payment can only be processed from the registered domain: ${merchantDomainName}`);
            console.error(`Current domain (${currentHost}) does not match registered domain (${merchantDomainName})`);
            return;
        }

        const orderReference = `ORDER-${Date.now()}`;
        const orderDate = Math.floor(Date.now() / 1000);
        const amount = Number(totalValue.toFixed(2));

        const productName = ['Оплата послуги'];
        const productCount = ['1'];
        const productPrice = [amount.toFixed(2)];

        // Create signature string according to WayForPay documentation
        const signatureFields = [
            merchantAccount,
            merchantDomainName,
            orderReference,
            orderDate.toString(),
            amount.toFixed(2),
            'KZT',
            productName[0],
            productCount[0],
            productPrice[0]
        ];

        const signatureString = signatureFields.join(';') + ';' + merchantSecretKey;
        const merchantSignature = md5(signatureString);

        const paymentData: WayforpayPaymentData = {
            merchantAccount,
            merchantDomainName,
            orderReference,
            orderDate,
            amount,
            currency: 'KZT' as const,
            productName,
            productCount,
            productPrice,
            clientFirstName: 'Yaroslav',
            clientLastName: 'Tsarenko',
            clientEmail: 'yaroslav7v@gmail.com',
            clientPhone: '0972796855',
            language: 'UA',
            returnUrl: `https://${merchantDomainName}/thank-you`,
            serviceUrl: `https://${merchantDomainName}/payment-callback`,
            merchantSignature,
            auth: 'SimpleSignature',
            transactionType: 'SALE',
            paymentSystems: 'card;privat24',
            defaultPaymentSystem: 'card',
            holdTimeout: 86400,
            orderTimeout: 86400,
            orderLifetime: 86400
        };

        const launchWidget = () => {
            try {
                if (typeof window !== 'undefined' && window.Wayforpay) {
                    const wayforpay = new window.Wayforpay();
                    wayforpay.run(paymentData);
                } else {
                    console.error('WayForPay widget is not loaded');
                    alert('Payment system is not available. Please try again later.');
                }
            } catch (error) {
                console.error('Error launching WayForPay widget:', error);
                alert('Failed to initialize payment system. Please try again later.');
            }
        };

        // Load WayForPay script if not already loaded
        if (typeof window !== 'undefined' && !window.Wayforpay) {
            const script = document.createElement('script');
            script.src = 'https://secure.wayforpay.com/server/pay-widget.js';
            script.async = true;
            script.onload = launchWidget;
            script.onerror = () => {
                console.error('Failed to load WayForPay script');
                alert('Failed to load payment system. Please check your internet connection and try again.');
            };
            document.body.appendChild(script);
        } else {
            launchWidget();
        }
    };


    const handleFromLanguageChange = (value: string) => {
        setFromLanguage(value);
        handleLanguagePairChange(value, toLanguage);
    };

    const handleToLanguageChange = (value: string) => {
        setToLanguage(value);
        handleLanguagePairChange(fromLanguage, value);
    };

    const handleTariffSelect = (selectedTariff: string) => {
        setTariff(selectedTariff);
    };

    const handleDocumentSelect = (title: string) => {
        const typeMatch = title.match(/\((.*?)\)/);
        const type = typeMatch ? typeMatch[1] : 'Unknown';
        addDocument({name: title, type});
    };

    const renderDocumentType = (name: string) => {
        const match = name.match(/\((.*?)\)/);
        const documentName = name.replace(/\s*\(.*?\)/, '');
        const documentType = match ? `(${match[1]})` : null;

        return (
            <span>
            <span style={{color: '#565add'}}>{documentName}</span>
                {documentType && <> - <span>{documentType}</span></>}
        </span>
        );
    };

    const renderContent = () => {
        switch (activePage) {
            case 1:
                return <div className={styles.documentsContent}>
                    {documentTypes[activeCountry].map((type, index) => (
                        <DocumentItem
                            key={index}
                            title={type}
                            onSelect={() => handleDocumentSelect(type)}
                        />
                    ))}
                </div>;
            case 2:
                return (
                    <div className={styles.tariffAndLanguage}>
                        <div className={styles.languagePair}>
                            <p>Выберите языковую пару для документа</p>
                            <div className={styles.selectors}>
                                <Select
                                    value={fromLanguage}
                                    onChange={(_, value) => handleFromLanguageChange(value || "")}
                                    sx={{width: "100%"}}>
                                    <Option value="русский">Русский</Option>
                                    <Option value="английский">Английский</Option>
                                    <Option value="казахский">Казахский</Option>
                                    <Option value="украинский">Украинский</Option>
                                    <Option value="польский">Польский</Option>
                                </Select>
                                <HiMiniArrowsRightLeft size={50}/>
                                <Select
                                    value={toLanguage}
                                    onChange={(_, value) => handleToLanguageChange(value || "")}
                                    sx={{width: "100%"}}>
                                    <Option value="русский">Русский</Option>
                                    <Option value="английский">Английский</Option>
                                    <Option value="казахский">Казахский</Option>
                                    <Option value="украинский">Украинский</Option>
                                    <Option value="польский">Польский</Option>
                                </Select>
                            </div>
                            <p style={{color: "red"}}>{fromLanguage === toLanguage ? "Языковая пара не может быть одинаковой" : ""}</p>
                        </div>
                        <div className={styles.tariffs}>
                            <TariffItem
                                title="Normal"
                                description="Перевод документов завтра на утро"
                                benefits={[
                                    {iconSrc: timeIcon, text: 'Гарантия доставки до 31 апреля 9:00 (Астаны)'},
                                    {iconSrc: garry, text: 'Обычная скорость перевода'},
                                    {iconSrc: discount, text: 'на 15% дешевле средней цены на рынке'},
                                ]}
                                price={499}
                                borderRadius={['30px', '0', '0', '30px']}
                                onSelect={() => handleTariffSelect('Normal')}
                                isSelected={tariff === 'Normal'}
                            />
                            <TariffItem
                                title="Express"
                                description="Перевод документов завтра на утро"
                                benefits={[
                                    {iconSrc: timeIconPurple, text: 'Гарантия доставки до 31 апреля 9:00 (Астаны)'},
                                    {iconSrc: fast, text: 'Ускоряемся для быстрого перевода'},
                                    {iconSrc: discountPurple, text: 'на 25% дешевле средней цены на рынке'},
                                ]}
                                price={699}
                                borderRadius={['0', '0', '0', '0']}
                                onSelect={() => handleTariffSelect('Express')}
                                isSelected={tariff === 'Express'}
                            />
                            <TariffItem
                                title="Fast"
                                description="Перевод документов завтра на утро"
                                benefits={[
                                    {iconSrc: timeIconWhite, text: 'Гарантия доставки до  "Дата" 11:00 (Астаны)'},
                                    {iconSrc: lightning, text: 'Молниеносный перевод'},
                                    {iconSrc: discountWhite, text: 'на 35% дешевле средней цены на рынке'},
                                ]}
                                price={899}
                                borderRadius={['0', '30px', '30px', '0']}
                                onSelect={() => handleTariffSelect('Fast')}
                                isSelected={tariff === 'Fast'}
                            />
                        </div>
                    </div>
                );
            case 3:
                return <div className={styles.dropFile}>
                    <Image src={dropFile} alt={"file"} width={120} height={120}/>
                    <h5>ПРЕДОСТАВЬТЕ КАЧЕСТВЕННУЮ СКАН-КОПИЮ ИЛИ ФОТО ДОКУМЕНТОВ ДЛЯ ПЕРЕВОДА</h5>
                    <h4>Обращаем Ваше внимание, что в случае предоставления некачественных изображений оригинала
                        документа, Вы соглашаетесь с тем, что будет переведена лишь та часть, которая будет
                        отчетливо видна. Расшифровку печатей и штампов Вы сможете предоставить на следующем шаге.</h4>

                    {isMobileView ? <p><span>Загрузите</span> файлы в это окно</p> :
                        <p>Перетяните или <span>загрузите</span> файлы в это окно</p>
                    }
                </div>;
            case 4:
                return <div className={styles.accordionWrapper}>
                    {selectedDocuments.map((doc, index) => (
                        <Accordion key={index}
                                   sx={{boxShadow: "none", borderBottom: "1px solid #cccccc", padding: "10px 0"}}>
                            <AccordionSummary expandIcon={<IoIosArrowDown/>}>
                                <h2 className={styles.accordionTitle}>
                                    Данные для {renderDocumentType(doc.name)}
                                </h2>
                            </AccordionSummary>
                            <AccordionDetails className={styles.accordionDetails}>
                                <div className={styles.inputWrapper}>
                                    <p>
                                        ФИО латиницей
                                    </p>
                                    <Input
                                        id="fio-input"
                                        fullWidth
                                        placeholder="Фамилия Имья Отчество"
                                        sx={{mb: 2}}/>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <p>
                                        Печать
                                    </p>
                                    <Input
                                        id="seal-input"
                                        fullWidth
                                        placeholder="Рассшифровка печати"
                                        sx={{mb: 2}}/>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <p>
                                        Штамп
                                    </p>
                                    <Input
                                        id="stamp-input"
                                        fullWidth
                                        placeholder="Рассшифровка штампа"/>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>;
            case 5:
                return (
                    <div className={styles.finalDocuments}>
                        {selectedDocuments.map((doc, index) => (
                            <DocumentFinalItem
                                key={index}
                                documentName={doc.name}
                                documentFullName={`${doc.name}`}
                                tariff={tariff || ''}
                                languagePair={{from: fromLanguage || '', to: toLanguage || ''}}
                            />
                        ))}
                    </div>
                );
            default:
                return <p>Invalid page.</p>;
        }
    };

    const renderButtons = () => {
        const isNextDisabled = activePage === 2 && selectedDocuments.length === 0;

        switch (activePage) {
            case 1:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined onClick={() => setActivePage(activePage + 1)} disabled={isNextDisabled}>
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}}
                                        onClick={() => setActivePage(activePage - 1)}>
                            Назад
                        </ButtonOutlined>
                        <ButtonOutlined
                            onClick={() => setActivePage(activePage + 1)}
                        >
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}}
                                        onClick={() => setActivePage(activePage - 1)}>
                            Назад
                        </ButtonOutlined>
                        <ButtonOutlined
                            onClick={() => setActivePage(activePage + 1)}
                        >
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 4:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}}
                                        onClick={() => setActivePage(activePage - 1)}>
                            Назад
                        </ButtonOutlined>
                        <ButtonOutlined
                            onClick={() => setActivePage(activePage + 1)}
                            disabled={isNextDisabled}>
                            Продолжить
                        </ButtonOutlined>
                    </div>
                );
            case 5:
                return (
                    <div className={styles.documentNavigation}>
                        <ButtonOutlined outlined sx={{borderColor: "1px solid #d6e0ec"}}
                                        onClick={() => setActivePage(activePage - 1)}>
                            Назад
                        </ButtonOutlined>
                        <ButtonOutlined
                            onClick={() => handlePay()}
                        >
                            Перейти к оплате
                        </ButtonOutlined>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderTitle = () => {
        switch (activePage) {
            case 1:
                return <h2>Выберите <span>тип</span> документа</h2>;
            case 2:
                return <h2>Выберите <span>язык и подходящий тариф</span></h2>;
            case 3:
                return <h2>Загрузите <span>файл</span></h2>;
            case 4:
                return <h2>Введите <span>данные из документов</span></h2>;
            case 5:
                return <h2>Общая стоимость: <span>{totalValue} ₸</span></h2>;
            default:
                return null;
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.toggles}>
                <Button
                    onClick={() => setActiveCountry('KZ')}
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
                    <Image src={kzFlag} alt="ua" width={16} height={16}/>
                    Казахстан
                </Button>
                <Button
                    onClick={() => setActiveCountry('UA')}
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
                    <Image src={uaFlag} alt="kz" width={16} height={16}/>
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