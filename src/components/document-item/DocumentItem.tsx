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
}

const DocumentItem: FC<DocumentItemProps> = ({
                                                 title,
                                                 onSelect,
                                                 onDeselect,
                                                 img,
                                                 selectedVariants,
                                                 selected
                                             }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(selected || false);

    useEffect(() => {
        setIsChecked(selected || false);
    }, [selected]);

    const handleWrapperClick = () => {
        onSelect(title);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);

        if (newChecked) {
            onSelect(title);
        } else {
            onDeselect?.(title);
        }

        e.stopPropagation();
    };

    const handleDialogOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const isEGov = title === "E-GOV" || title === "Дія";

    return (
        <div
            className={`${styles.wrapper} ${isChecked ? styles.active : ""} ${
                isEGov ? styles.eGov : ""
            }`}
            onClick={handleWrapperClick}>
            {img && (
                <div className={styles.imgWrapper}>
                    <Image
                        src={img}
                        className={styles.image}
                        alt={title}
                        width={330}
                        height={150}
                    />
                    <Tooltip title="Посмотреть документ" placement="top">
                        <div className={styles.icon}>
                            <IconButton>
                                <IoSearchOutline onClick={handleDialogOpen} />
                            </IconButton>
                        </div>
                    </Tooltip>
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
            <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md">
                <div style={{ textAlign: "center" }}>
                    {img && (
                        <Image
                            className={styles.dialogImage}
                            src={img}
                            alt={title}
                            width={600}
                            height={400}
                        />
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default DocumentItem;
