"use client";

import React, {FC, useEffect} from 'react';
import styles from './Message.module.scss';
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";

interface MessageProps {
    title?: string;
    description?: string;
    autoRedirect?: boolean;
    showButton?: boolean;
}

const Message:FC<MessageProps> = ({title, description, autoRedirect = false, showButton = true}) => {

    useEffect(() => {
        if (!autoRedirect) return;
        const timer = setTimeout(() => {
            window.location.href = '/';
        }, 5000);
        return () => clearTimeout(timer);
    }, [autoRedirect]);

    const handleRedirect = () => {
        window.location.href = '/';
    }

    return (
        <div className={styles.wrapper}>
            <h1>{title}</h1>
            <p>{description}</p>
            {showButton && (
                <ButtonOutlined onClick={handleRedirect}>
                    Вернуться на главную
                </ButtonOutlined>
            )}
        </div>
    );
};

export default Message;