import axios from 'axios';

export const getInitialGeneralData = async () => {
    try {
        const [generalRes, documentsRes] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/general-settings/get-general-settings`),
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/get-all-documents`)
        ]);

        return {
            general: generalRes.data,
            documents: documentsRes.data,
        };
    } catch (error) {
        console.error('SSR fetch error', error);
        return {
            general: null,
            documents: [],
        };
    }
};
