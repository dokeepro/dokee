"use client";

import React, {FC, useEffect, useState} from 'react';
import styles from "./PageWrapper.module.scss";
import Image from "next/image";
import videoIntro from "@/assets/images/video-intro.svg";
import Dialog from '@mui/material/Dialog';
import {usePathname} from 'next/navigation';
import {useGeneral} from "@/context/GeneralContext";
import {useDocumentContext} from "@/context/DocumentContext";

interface PageWrapperProps {
    children: React.ReactNode;
}

const PageWrapper: FC<PageWrapperProps> = ({children}) => {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const YT_VIDEO_ID = "RzVvThhjAKw";
    const pathname = usePathname();
    const {general} = useGeneral();
    const { activePage } = useDocumentContext();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = scrollTop / docHeight;

            setVisible(scrollPercent >= 0.05 && scrollPercent <= 0.4);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {general?.sitePaused ? (
                <div className={styles.pausedContainer}>
                    <div className={styles.pausedContainerInner}>
                        <h1>Приносим извинения за временные неудобства</h1>
                        <p>В настоящее время сайт находится на техническом обслуживании и будет доступен в ближайшее
                            время.</p>
                    </div>
                </div>
            ) : (
                <div className={styles.outer}>
                    {pathname !== '/admin' && ![2, 3, 4, 5].includes(activePage) && (
                        <Image
                            src={videoIntro}
                            alt="Video"
                            height={183}
                            width={138}
                            onClick={() => setOpen(true)}
                            className={`${styles.videoIntro} ${visible ? styles.visible : ""}`}
                        />
                    )}
                    <Dialog
                        open={open}
                        onClose={() => setOpen(false)}
                        maxWidth={false}
                        PaperProps={{
                            sx: {
                                p: 0,
                                background: "transparent",
                                boxShadow: "none",
                            },
                        }}>
                        <div className={styles.videoDialogContainer}>
                            <iframe
                                src={`https://www.youtube.com/embed/${YT_VIDEO_ID}`}
                                title="YouTube video"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                className={styles.videoDialogFrame}
                            />
                        </div>
                    </Dialog>
                    <main className={styles.main}>{children}</main>
                </div>

            )}
        </>
    );
};

export default PageWrapper;
