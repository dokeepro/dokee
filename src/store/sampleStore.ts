import { create } from 'zustand';
import {Dayjs} from "dayjs";

export interface LanguageTariff {
    language: string;
    normal: number;
    express: number;
    fast: number;
}

export interface SelectedSample {
    id: string;
    docName: string;
    sampleTitle: string;
    languageTariffs: LanguageTariff[];
    image?: string;
    fioLatin?: string;
    sealText?: string;
    stampText?: string;
}

interface SampleStore {
    selectedSamples: SelectedSample[];
    fromLanguage: string | null;
    toLanguage: string | null;
    selectedTariff: string | null;
    uploadedFiles: File[];
    country: 'KZ' | 'UA' | null;
    setCountry: (country: 'KZ' | 'UA' | null) => void;
    toggleSample: (sample: SelectedSample) => void;
    isSampleSelected: (id: string) => boolean;
    removeSamplesForDocument: (docName: string) => void;
    setSampleField: (
        id: string,
        field: 'fioLatin' | 'sealText' | 'stampText',
        value: string
    ) => void;
    setFromLanguage: (lang: string | null) => void;
    setToLanguage: (lang: string | null) => void;
    setSelectedTariff: (tariff: string | null) => void;
    setUploadedFiles: (files: File[]) => void;
    addUploadedFiles: (files: File[]) => void;
    removeUploadedFile: (index: number) => void;
    selectedDate: Dayjs | null;
    setSelectedDate: (date: Dayjs | null) => void;
    clearAll: () => void;
    localActivePage: number | null;
    setLocalActivePage: (page: number | null) => void;
}

export const useSampleStore = create<SampleStore>((set, get) => ({
    selectedSamples: [],
    fromLanguage: null,
    toLanguage: null,
    selectedTariff: null,
    uploadedFiles: [],
    country: null,
    selectedDate: null,
    localActivePage: null,
    setLocalActivePage: (page) => set({ localActivePage: page }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setCountry: (country) => set({ country }),
    toggleSample: (sample) => {
        const exists = get().selectedSamples.some((s) => s.id === sample.id);
        set((state) => ({
            selectedSamples: exists
                ? state.selectedSamples.filter((s) => s.id !== sample.id)
                : [...state.selectedSamples, sample],
        }));
    },
    isSampleSelected: (id) =>
        get().selectedSamples.some((s) => s.id === id),
    removeSamplesForDocument: (docName) =>
        set((state) => ({
            selectedSamples: state.selectedSamples.filter(
                (s) => s.docName !== docName
            ),
        })),
    setSampleField: (id, field, value) =>
        set((state) => ({
            selectedSamples: state.selectedSamples.map((s) =>
                s.id === id ? { ...s, [field]: value } : s
            ),
        })),
    setFromLanguage: (lang) => set({ fromLanguage: lang }),
    setToLanguage: (lang) => set({ toLanguage: lang }),
    setSelectedTariff: (tariff) => set({ selectedTariff: tariff }),
    setUploadedFiles: (files) => set({ uploadedFiles: files }),
    addUploadedFiles: (files) =>
        set((state) => ({
            uploadedFiles: [...state.uploadedFiles, ...files],
        })),
    removeUploadedFile: (index) =>
        set((state) => ({
            uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index),
        })),
    clearAll: () => set({
        selectedSamples: [],
        uploadedFiles: [],
        fromLanguage: null,
        toLanguage: null,
        selectedTariff: null,
        country: null,
    }),

}));