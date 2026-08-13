'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { newRequest } from '@/utils/newRequest';
import { LanguageTariff } from '@/store/sampleStore';

export interface GeneralSettings {
    sitePaused: boolean;
    kzNormalSlots: number;
    kzExpressSlots: number;
    kzFastSlots: number;
    uaNormalSlots: number;
    uaExpressSlots: number;
    uaFastSlots: number;
}

export interface Sample {
    title: string;
    imageUrl?: string;
    languageTariffs?: LanguageTariff[];
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
}

export interface Document {
    _id: string;
    name: string;
    documentCountry?: string;
    order: number;
    languageTariffs: LanguageTariff[];
    samples: Sample[];
}

interface GeneralContextProps {
    general: GeneralSettings | null;
    setGeneral: React.Dispatch<React.SetStateAction<GeneralSettings | null>>;
    fetchGeneral: () => Promise<void>;
    loading: boolean;
    documents: Document[];
    fetchDocuments: () => Promise<void>;
    documentLoader: boolean;
}

interface GeneralProviderProps {
    children: React.ReactNode;
    initialDocuments?: Document[];
    initialGeneral?: GeneralSettings | null;
}

const GeneralContext = createContext<GeneralContextProps>({
    general: null,
    setGeneral: () => {},
    fetchGeneral: async () => {},
    loading: false,
    documents: [],
    fetchDocuments: async () => {},
    documentLoader: false,
});

export const useGeneral = () => useContext(GeneralContext);

export const GeneralProvider = ({
                                    children,
                                    initialDocuments = [],
                                    initialGeneral = null,
                                }: GeneralProviderProps) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [general, setGeneral] = useState(initialGeneral);
    const [loading, setLoading] = useState(true);
    const [documentLoader, setDocumentLoader] = useState(false);

    const fetchDocuments = async () => {
        try {
            const res = await newRequest.get("/documents/get-all-documents");
            setDocuments(res.data);
            setDocumentLoader(false);
            return res.data;
        } catch (error) {
            console.error('fetchDocuments error', error);
            return null;
        }
    };

    const fetchGeneral = async () => {
        try {
            const res = await newRequest.get("/general-settings/get-general-settings");
            setGeneral(res.data);
            return res.data;
        } catch (error) {
            console.error('fetchGeneral error', error);
            return null;
        }
    };

    const syncWithServer = async () => {
        await Promise.all([fetchDocuments(), fetchGeneral()]);
    };

    useEffect(() => {
        const load = async () => {
            try {
                await syncWithServer();
            } catch (error) {
                console.error('Client sync error', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <GeneralContext.Provider
            value={{
                general,
                setGeneral,
                fetchGeneral,
                loading,
                documents,
                fetchDocuments,
                documentLoader,
            }}
        >
            {children}
        </GeneralContext.Provider>
    );
};