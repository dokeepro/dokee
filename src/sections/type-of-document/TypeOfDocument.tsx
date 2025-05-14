"use client";

import React, {useState} from 'react';
import styles from "./TypeOfDocument.module.scss";
import {Button} from "@mui/material";
import uaFlag from "@/assets/icons/ua-icon.png";
import kzFlag from "@/assets/icons/kz-icon.png";
import Image from "next/image";
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";
import DocumentItem from "@/components/document-item/DocumentItem";
import documentTypes from "@/constants/documentTypes";

const TypeOfDocument = () => {

    const [activePage, setActivePage] = useState(1);
    const [activeCountry, setActiveCountry] = useState('kz');

    return (
        <div className={styles.wrapper}>
            <div className={styles.toggles}>
                <Button
                    onClick={() => setActiveCountry('kz')}
                    sx={{
                        borderRadius: "10px 0 0 0",
                        backgroundColor: activeCountry === 'kz' ? '#565add' : '#eff0ff',
                        color: activeCountry === 'kz' ? '#fff' : '#000',
                        textTransform: "none",
                        gap: "7px",
                        fontSize: "16px",
                        padding: "14px 27px",
                        '&:hover': {
                            backgroundColor: '#565add',
                            color: '#fff',
                        },
                    }}
                >
                    <Image src={kzFlag} alt="ua" width={16} height={16}/>
                    Казахстан
                </Button>
                <Button
                    onClick={() => setActiveCountry('ua')}
                    sx={{
                        borderRadius: "0 10px 0 0",
                        backgroundColor: activeCountry === 'ua' ? '#565add' : '#eff0ff',
                        color: activeCountry === 'ua' ? '#fff' : '#000',
                        textTransform: "none",
                        gap: "7px",
                        padding: "14px 27px",
                        fontSize: "16px",
                        '&:hover': {
                            backgroundColor: '#565add',
                            color: '#fff',
                        },
                    }}
                >
                    <Image src={uaFlag} alt="kz" width={16} height={16}/>
                    Украина
                </Button>
            </div>
            <div className={styles.documents}>
                <div className={styles.documentsHeader}>
                    <h2>
                        Выберите <span>тип</span> документа
                    </h2>
                    <div className={styles.pagination}>
                        {[1, 2, 3, 4, 5].map((number) => (
                            <Button
                                key={number}
                                onClick={() => setActivePage(number)}
                                sx={{
                                    minWidth: '40px',
                                    height: '40px',
                                    margin: '0 5px',
                                    backgroundColor: activePage === number ? '#565add' : '#eff0ff',
                                    color: activePage === number ? '#fff' : '#7f7f7f',
                                    border: '1px solid #d6e0ec',
                                    textTransform: 'none',
                                    fontSize: '14px',
                                    width: '57px',
                                    borderRadius: '10px',
                                    '&:hover': {
                                        backgroundColor: '#565add',
                                        color: '#fff',
                                    },
                                }}
                            >
                                {number}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className={styles.documentsContent}>
                    {documentTypes.map((type, index) => (
                        <DocumentItem key={index} title={type}/>
                    ))}
                </div>
                <div className={styles.documentNavigation}>
                    <ButtonOutlined>
                        Продолжить
                    </ButtonOutlined>
                </div>
            </div>
        </div>
    );
};

export default TypeOfDocument;