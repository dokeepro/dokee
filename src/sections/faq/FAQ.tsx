"use client";

import React, { useState } from 'react';
import faq from '@/constants/faq';
import styles from './FAQ.module.scss';
import FaqItem from '@/components/faq-item/FAQItem';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={styles.wrapper} id="faq">
            <div>
                {faq.slice(0, Math.ceil(faq.length / 2)).map((item, index) => (
                    <div key={index} className={styles.faqItemWrapper}>
                        <FaqItem
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    </div>
                ))}
            </div>
            <div>
                {faq.slice(Math.ceil(faq.length / 2)).map((item, index) => (
                    <div key={index + Math.ceil(faq.length / 2)} className={styles.faqItemWrapper}>
                        <FaqItem
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index + Math.ceil(faq.length / 2)}
                            onToggle={() => handleToggle(index + Math.ceil(faq.length / 2))}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;