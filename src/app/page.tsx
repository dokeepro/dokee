"use client"

import React from 'react';
import { motion } from 'framer-motion';
import MainSection from '@/sections/main-section/MainSection';
import WhatRecieve from '@/sections/what-recieve/WhatRecieve';
import TypeOfDocument from '@/sections/type-of-document/TypeOfDocument';
import OfferDocument from '@/sections/offer-document/OfferDocument';
import FAQ from '@/sections/faq/FAQ';

const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
    >
        {children}
    </motion.div>
);

const Page = () => {
    return (
        <>
            <AnimatedSection>
                <MainSection />
            </AnimatedSection>
            <AnimatedSection>
                <TypeOfDocument />
            </AnimatedSection>
            <AnimatedSection>
                <WhatRecieve />
            </AnimatedSection>
            <AnimatedSection>
                <OfferDocument />
            </AnimatedSection>
            <AnimatedSection>
                <FAQ />
            </AnimatedSection>
        </>
    );
};

export default Page;