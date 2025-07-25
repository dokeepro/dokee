"use client";

import React, {FC, useEffect} from 'react';
import styles from './Message.module.scss';
import ButtonOutlined from "@/components/custom-button/ButtonOutlined";

interface MessageProps {
    title?: string;
    description?: string;
}

const Message:FC<MessageProps> = ({title, description}) => {

    useEffect(() => {
        setTimeout(() => {
            window.location.href = '/';
        }, 5000)
    })

    const handleRedirect = () => {
        window.location.href = '/';
    }

    return (
        <div className={styles.wrapper}>
            <h1>{title}</h1>
            <p>{description}</p>
            <ButtonOutlined onClick={handleRedirect}>
                Вернуться на главную
            </ButtonOutlined>
        </div>
    );
};

export default Message;