import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Document {
    name: string;
    type: string;
}

interface DocumentContextProps {
    selectedDocuments: Document[];
    languagePair: { from: string; to: string } | null;
    tariff: string | null;
    addDocument: (document: Document) => void;
    setLanguagePair: (pair: { from: string; to: string }) => void;
    setTariff: (tariff: string) => void;
    removeDocument: (name: string) => void;
}

const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
    const [languagePair, setLanguagePair] = useState<{ from: string; to: string } | null>(null);
    const [tariff, setTariff] = useState<string | null>(null);

    const addDocument = (document: Document) => {
        setSelectedDocuments((prev) => [...prev, document]);
    };

    return (
        <DocumentContext.Provider
            value={{
                selectedDocuments,
                languagePair,
                tariff,
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