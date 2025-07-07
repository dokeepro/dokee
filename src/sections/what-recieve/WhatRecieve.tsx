import React from 'react';
import styles from "./WhatRecieve.module.scss"
import fast from "@/assets/icons/image-1.svg";
import quality from "@/assets/icons/image-2.svg";
import cheapest from "@/assets/icons/image-3.svg";
import BenefitItem from "@/components/benefit-item/BenefitItem";

const WhatRecieve = () => {
    return (
        <div className={styles.wrapper} id="calculator">
            <h1>Что вы получите?</h1>
            <p>В сфере переводов есть 3 важнейших фактора, на которые мы ориентируемся</p>
            <div className={styles.content}>
                <BenefitItem title="Быстрый перевод документов" description="Готовы выполнить перевод документов менее, чем за 2 часа!" image={fast}/>
                <BenefitItem title="Качественный подход к реализации" description="Гарантируем, что получите перевод на уровне носителя языка." image={quality}/>
                <BenefitItem title="Дешевле чем у других компаний" description="Предлагаем самую низкую стоимость при идеальном качестве!" image={cheapest}/>
            </div>
        </div>
    );
};

export default WhatRecieve;