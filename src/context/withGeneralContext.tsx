import { newRequest } from "@/utils/newRequest";
import { GeneralProvider } from "./GeneralContext";
import { ComponentType, ReactNode } from "react";
import { Document, GeneralSettings } from "./GeneralContext";

interface WrappedComponentProps {
    children?: ReactNode;
}

export function withGeneralContext<T extends WrappedComponentProps>(
    Component: ComponentType<T>
) {
    return async function WrappedComponent(props: T) {
        let general: GeneralSettings | null = null;
        let documents: Document[] = [];

        try {
            const [generalRes, documentsRes] = await Promise.all([
                newRequest.get("/general-settings/get-general-settings"),
                newRequest.get("/documents/get-all-documents"),
            ]);
            general = generalRes.data;
            documents = documentsRes.data;
        } catch (error) {
            console.error("Server-side fetch error:", error);
        }

        return (
            <GeneralProvider initialGeneral={general} initialDocuments={documents}>
                <Component {...props} />
            </GeneralProvider>
        );
    };
}
