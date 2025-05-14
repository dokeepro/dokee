"use client";

import React, {FC, useState} from 'react';
import {Checkbox} from "@mui/material";
import styles from "./DocumentItem.module.scss";

interface DocumentItemProps {
    title: string;
}

const DocumentItem: FC<DocumentItemProps> = ({title}) => {
    const [isActive, setIsActive] = useState(false);

    const handleCheckboxChange = () => {
        setIsActive(!isActive);
    };

    const isEGov = title === "E-GOV";

    return (
        <div
            className={`${styles.wrapper} ${isActive ? styles.active : ''} ${isEGov ? styles.eGov : ''}`}
        >
            <h3>
                {title}
            </h3>
            <Checkbox onChange={handleCheckboxChange} />
        </div>
    );
};

export default DocumentItem;