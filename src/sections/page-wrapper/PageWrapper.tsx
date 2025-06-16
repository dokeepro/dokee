"use client";

import React, { FC, useState } from 'react';
import styles from "./PageWrapper.module.scss";
import Image from "next/image";
import videoIntro from "@/assets/images/video-intro.svg";
import Dialog from '@mui/material/Dialog';

interface PageWrapperProps {
    children: React.ReactNode;
}

const PageWrapper:FC<PageWrapperProps> = ({children}) => {

    const [open, setOpen] = useState(false);
    const YT_VIDEO_ID = "RzVvThhjAKw";

    return (
        <div className={styles.outer}>
            <Image
                src={videoIntro}
                className={styles.videoIntro}
                alt="Video"
                height="183"
                width="138"
                onClick={() => setOpen(true)}
                style={{ cursor: 'pointer' }}/>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        p: 0,
                        background: "transparent",
                        boxShadow: "none"
                    }
                }}>
                <div className={styles.videoDialogContainer} style={{ padding: 0 }}>
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
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default PageWrapper;