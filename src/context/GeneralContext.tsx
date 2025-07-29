'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { newRequest } from '@/utils/newRequest';
import { LanguageTariff } from '@/store/sampleStore';
import axios from 'axios';

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
        const res = await newRequest.get("/documents/get-all-documents");
        setDocuments(res.data);
        setDocumentLoader(false);
        return res.data;
    };

    const fetchGeneral = async () => {
        const res = await newRequest.get("/general-settings/get-general-settings");
        setGeneral(res.data);
        return res.data;
    };

    const syncWithServer = async () => {
        const [latestDocuments, latestGeneral] = await Promise.all([
            fetchDocuments(),
            fetchGeneral()
        ]);


        const isDocumentsDifferent = JSON.stringify(latestDocuments) !== JSON.stringify(initialDocuments);
        if (isDocumentsDifferent) {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/update-cache`, {
                documents: latestDocuments
            });
        }


        const isGeneralDifferent = JSON.stringify(latestGeneral) !== JSON.stringify(initialGeneral);
        if (isGeneralDifferent) {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/general-settings/update-cache`, {
                general: latestGeneral
            });
        }
    };

    useEffect(() => {
        const load = async () => {
            await syncWithServer();
            setLoading(false);
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