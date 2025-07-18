"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageTariff {
    language: string;
    normal: number;
    express: number;
    fast: number;
    _id?: string;
}

interface DocumentSample {
    name: string;
    image: string;
}

interface Sample {
    title: string;
    languageTariffs?: LanguageTariff[];
    imageUrl?: string;
    image?: string;
}

interface Document {
    name: string;
    type?: string;
    selectedSamples?: DocumentSample[];
    samples?: Sample[];
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
    uploadedFiles?: File[];
}

interface DocumentContextProps {
    selectedDocuments: Document[];
    languagePair: string | null;
    tariff: string | null;
    uploadedFiles: File[];
    activePage: number;
    setActivePage: (page: number) => void;
    addDocument: (document: Document) => void;
    setUploadedFiles: (files: File[]) => void;
    setLanguagePair: (pair: string) => void;
    setTariff: (tariff: string) => void;
    removeDocument: (name: string) => void;
    country: 'KZ' | 'UA';
    setCountry: (country: 'KZ' | 'UA') => void;
    currentDoc: Document | null;
    setCurrentDoc: (doc: Document | null) => void;
}

const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
    const [languagePair, setLanguagePair] = useState<string | null>(null);
    const [tariff, setTariff] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [activePage, setActivePage] = useState<number>(1);
    const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
    const [country, setCountry] = useState<'KZ' | 'UA'>('KZ');

    const addDocument = (document: Document) => {
        setSelectedDocuments((prev) => {
            const exists = prev.find((doc) => doc.name === document.name);
            return exists
                ? prev.map((doc) => doc.name === document.name ? { ...doc, ...document } : doc)
                : [...prev, document];
        });
    };

    return (
        <DocumentContext.Provider
            value={{
                selectedDocuments,
                languagePair,
                tariff,
                uploadedFiles,
                activePage,
                setActivePage,
                setUploadedFiles,
                addDocument,
                setLanguagePair,
                currentDoc,
                setCurrentDoc,
                setTariff,
                removeDocument: (name: string) =>
                    setSelectedDocuments((prev) => prev.filter((doc) => doc.name !== name)),
                country,
                setCountry,
            }}
        >
            {children}
        </DocumentContext.Provider>
    );
};

export const useDocumentContext = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocumentContext must be used within a DocumentProvider');
    }
    return context;
};