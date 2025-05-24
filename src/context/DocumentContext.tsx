import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DocumentSample {
    name: string;
    image: string;
}

interface Document {
    name: string;
    type?: string;
    selectedSamples?: DocumentSample[];
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
    addDocument: (document: Document) => void;
    setUploadedFiles: (files: File[]) => void;
    setLanguagePair: (pair: string) => void;
    setTariff: (tariff: string) => void;
    removeDocument: (name: string) => void;
}
const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
    const [languagePair, setLanguagePair] = useState<string | null>(null);
    const [tariff, setTariff] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
                setUploadedFiles,
                addDocument,
                setLanguagePair,
                setTariff,
                removeDocument: (name: string) =>
                    setSelectedDocuments((prev) => prev.filter((doc) => doc.name !== name)),
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