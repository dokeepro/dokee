// app/context/GeneralContext.tsx
'use client';

import React, {
    createContext, useContext, useState, ReactNode, useEffect,
} from 'react';
import { newRequest } from '@/utils/newRequest';
import { Backdrop, CircularProgress } from '@mui/material';
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
                                    initialGeneral = null,
                                    initialDocuments = [],
                                }: {
    children: ReactNode;
    initialGeneral?: GeneralSettings | null;
    initialDocuments?: Document[];
}) => {
    const [general, setGeneral] = useState<GeneralSettings | null>(initialGeneral);
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [loading, setLoading] = useState(!initialGeneral || !initialDocuments.length);
    const [documentLoader, setDocumentLoader] = useState(false);

    const fetchGeneral = async () => {
        try {
            const res = await newRequest.get('/general-settings/get-general-settings');
            setGeneral(res.data);
        } catch (e) {
            console.error('Error fetching general settings', e);
        }
    };

    const fetchDocuments = async () => {
        setDocumentLoader(true);
        try {
            const res = await newRequest.get('/documents/get-all-documents');
            setDocuments(res.data);
        } catch (e) {
            console.error('Error fetching documents', e);
        } finally {
            setDocumentLoader(false);
        }
    };

    // Optional: Keep data fresh after hydration
    useEffect(() => {
        if (!initialGeneral || !initialDocuments.length) {
            const fetchAll = async () => {
                setLoading(true);
                await Promise.all([fetchGeneral(), fetchDocuments()]);
                setLoading(false);
            };
            fetchAll();
        }
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
            <Backdrop open={loading} invisible sx={{ color: '#fff', zIndex: 1301 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </GeneralContext.Provider>
    );
};
