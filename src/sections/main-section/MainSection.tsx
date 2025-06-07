import React from 'react';
import styles from "./MainSection.module.scss";
import Image from "next/image";
import arrow from "@/assets/images/arrow.svg"

const MainSection = () => {
    return (
        <div className={styles.wrapper} id="main">
            <div className={styles.title}>
                <h1>Качественный перевод</h1>
                <h1>личных документов</h1>
                <h1>быстрее, чем нужно</h1>
            </div>
            <p>Оформление даже простого заказа занимает время. Больше не нужно согласовывать каждый шаг —
                просто закажите перевод указанных ниже документов, и мы ГАРАНТИРУЕМ качество и соблюдение сроков</p>
            <Image src={arrow} alt="arrow" width={180} height={76}/>
        </div>
    );
};

export default MainSection;