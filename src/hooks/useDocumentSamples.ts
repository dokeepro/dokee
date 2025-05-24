import { useState } from 'react';
import documentTypes from '@/constants/documentTypes';
import { useDocumentContext } from '@/context/DocumentContext';

type Sample = { name: string; image: string };

export const useDocumentSamples = (activeCountry: 'KZ' | 'UA') => {
    const [samples, setSamples] = useState<Sample[] | null>(null);
    const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);
    const { addDocument, selectedDocuments } = useDocumentContext();

    const openSamples = (documentName: string) => {
        const doc = documentTypes[activeCountry].find(d => d.name === documentName);
        if (doc?.samples) {
            setSelectedDocumentName(documentName);
            setSamples(
                doc.samples.map(s => ({
                    name: s.sample.name,
                    image: typeof s.sample.image === 'string' ? s.sample.image : s.sample.image.src,
                }))
            );
        } else {
            addDocument({ name: documentName });
            resetSamples();
        }
    };

    const toggleSampleSelection = (sample: Sample) => {
        if (!selectedDocumentName) return;

        const existing = selectedDocuments.find(doc => doc.name === selectedDocumentName);
        const isSelected = existing?.selectedSamples?.some(s => s.name === sample.name);

        const updatedSamples = isSelected
            ? existing?.selectedSamples?.filter(s => s.name !== sample.name)
            : [...(existing?.selectedSamples || []), sample];

        addDocument({ name: selectedDocumentName, selectedSamples: updatedSamples });
    };

    const resetSamples = () => {
        setSamples(null);
        setSelectedDocumentName(null);
    };

    return {
        samples,
        selectedDocumentName,
        openSamples,
        toggleSampleSelection,
        resetSamples,
    };
};
