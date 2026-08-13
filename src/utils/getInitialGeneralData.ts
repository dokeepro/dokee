import { dbConnect } from "@/lib/db";
import DocumentModel from "@/models/Document";
import GeneralModel from "@/models/General";

export const getInitialGeneralData = async () => {
    try {
        await dbConnect();

        const [documents, general] = await Promise.all([
            DocumentModel.find().sort({ order: 1 }).lean(),
            GeneralModel.findOne().lean(),
        ]);

        // Serialize ObjectId/Date so the payload can cross the server/client boundary.
        return {
            documents: JSON.parse(JSON.stringify(documents)),
            general: general ? JSON.parse(JSON.stringify(general)) : null,
        };
    } catch (error) {
        console.error("SSR fetch error", error);
        return {
            documents: [],
            general: null,
        };
    }
};
