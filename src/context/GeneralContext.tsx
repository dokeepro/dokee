"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { newRequest } from '@/utils/newRequest';
import { Backdrop, CircularProgress } from '@mui/material';
import { LanguageTariff } from '@/store/sampleStore';

interface GeneralSettings {
    sitePaused: boolean;
    normalSlots: number;
    expressSlots: number;
    fastSlots: number;
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
}

const GeneralContext = createContext<GeneralContextProps>({
    general: null,
    setGeneral: () => {},
    fetchGeneral: async () => {},
    loading: false,
    documents: [],
    fetchDocuments: async () => {},
});

export const useGeneral = () => useContext(GeneralContext);

export const GeneralProvider = ({ children }: { children: ReactNode }) => {
    const [general, setGeneral] = useState<GeneralSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);

    const fetchGeneral = async () => {
        setLoading(true);
        try {
            const res = await newRequest.get('/general-settings/get-general-settings');
            setGeneral(res.data);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const res = await newRequest.get('/documents/get-all-documents');
            setDocuments(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGeneral();
        fetchDocuments();
    }, []);

    return (
        <GeneralContext.Provider value={{ general, setGeneral, fetchGeneral, loading, documents, fetchDocuments }}>
            {children}
            <Backdrop open={loading} sx={{ color: '#fff', zIndex: 1301 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </GeneralContext.Provider>
    );
};