"use client";

import React, { FC, useEffect, useState } from "react";
import { Checkbox, Tooltip, Dialog, IconButton } from "@mui/material";
import styles from "./DocumentItem.module.scss";
import Image from "next/image";
import { IoSearchOutline } from "react-icons/io5";

interface DocumentItemProps {
    title: string;
    img?: string;
    selectedVariants?: number;
    selected?: boolean;
    onSelect: (title: string) => void;
    onDeselect?: (title: string) => void;
    mode?: "sample" | "document";
}

const DocumentItem: FC<DocumentItemProps> = ({
                                                 title,
                                                 onSelect,
                                                 onDeselect,
                                                 img,
                                                 selectedVariants,
                                                 selected,
                                                 mode = "document",
                                             }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(selected || false);

    useEffect(() => {
        setIsChecked(selected || false);
    }, [selected]);

    const handleWrapperClick = () => {
        if (mode === "sample" && !isChecked) {
            onSelect(title);
        } else if (mode === "document") {
            onSelect(title);
        }
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // don't toggle via wrapper
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const newChecked = e.target.checked;
        setIsChecked(newChecked);

        if (newChecked) {
            onSelect(title);
        } else {
            onDeselect?.(title);
        }
    };

    const handleDialogOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDialogOpen(true);
    };

    const handleDialogClose = (
        event: React.SyntheticEvent,
        reason: "backdropClick" | "escapeKeyDown"
    ) => {
        setIsDialogOpen(false);
        console.log(event);
        console.log(reason);
    };

    const isEGov = title === "E-GOV" || title === "Дія";

    return (
        <>
            <div
                className={`${styles.wrapper} ${isChecked ? styles.active : ""} ${isEGov ? styles.eGov : ""}`}
                onClick={handleWrapperClick}>
                {img && (
                    <div className={styles.imgWrapper}>
                        <Image src={img} className={styles.image} alt={title} width={330} height={150} priority/>
                        <div className={styles.icon}>
                            <Tooltip title="Посмотреть документ" placement="top">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDialogOpen(e);
                                    }}
                                >
                                    <IoSearchOutline />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                )}
                <div className={styles.titlesWrapper}>
                    <div className={styles.titles}>
                        <h3>{title}</h3>
                        {selectedVariants ? (
                            <p>Выбрано вариантов ({selectedVariants})</p>
                        ) : null}
                    </div>
                    <Checkbox
                        checked={isChecked}
                        onClick={handleCheckboxClick}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md">
                <div style={{ textAlign: "center" }}>
                    {img && (
                        <Image
                            className={styles.dialogImage}
                            src={img}
                            alt={title}
                            width={600}
                            height={400}
                            priority
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default DocumentItem;
