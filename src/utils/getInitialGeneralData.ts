
import axios from 'axios';

export const getInitialDocuments = async () => {
    try {
        const documentsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/get-all-documents`
        );

        return {
            documents: documentsRes.data,
        };
    } catch (error) {
        console.error('SSR fetch error (documents)', error);
        return {
            documents: [],
        };
    }
};
