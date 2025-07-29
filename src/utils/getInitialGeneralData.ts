import axios from 'axios';

export const getInitialGeneralData = async () => {
    try {
        const [documentsRes, generalRes] = await Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/get-all-documents`),
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/general-settings/get-general-settings`)
        ]);

        return {
            documents: documentsRes.data,
            general: generalRes.data
        };
    } catch (error) {
        console.error('SSR fetch error', error);
        return {
            documents: [],
            general: null
        };
    }
};
