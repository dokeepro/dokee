"use client";

import React from 'react';
import { useDocumentContext } from '@/context/DocumentContext';
import { motion } from 'framer-motion';
import MainSection from '@/sections/main-section/MainSection';
import WhatRecieve from '@/sections/what-recieve/WhatRecieve';
import TypeOfDocument from '@/sections/type-of-document/TypeOfDocument';
import OfferDocument from '@/sections/offer-document/OfferDocument';
import FAQ from '@/sections/faq/FAQ';
import { DocumentProvider } from "@/context/DocumentContext";

const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}>
        {children}
    </motion.div>
);

const PageContent = () => {
    const { activePage } = useDocumentContext();

    if (activePage === 2 || activePage === 3 || activePage === 4 || activePage === 5) {
        return (
            <AnimatedSection>
                <div style={{padding: "5% 0"}}>
                    <TypeOfDocument />
                </div>
            </AnimatedSection>
        );
    }

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

const Page = () => (
    <DocumentProvider>
        <PageContent />
    </DocumentProvider>
);

export default Page;