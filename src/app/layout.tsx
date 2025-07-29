import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import PageWrapper from "@/sections/page-wrapper/PageWrapper";
import Popup, { PopupProvider } from "@/context/PopupContext";
import React from "react";
import { AlertProvider } from "@/context/AlertContext";
import { DocumentProvider } from "@/context/DocumentContext";
import { GeneralProvider } from "@/context/GeneralContext";
import WayforpayScript from "@/utils/WayforpayScript";
import ErrorBoundaryWrapper from "@/components/error-boundary/ErrorBoundaryWrapper";
import { getInitialDocuments } from "@/utils/getInitialGeneralData"; // renamed

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const { documents } = await getInitialDocuments();

    return (
        <html lang="en">
        <body>
        <ErrorBoundaryWrapper>
            <WayforpayScript />
            <GeneralProvider initialDocuments={documents}>
            <Header />
                <DocumentProvider>
                    <PageWrapper>
                        <PopupProvider>
                            <AlertProvider>
                                <Popup />
                                {children}
                            </AlertProvider>
                        </PopupProvider>
                    </PageWrapper>
                </DocumentProvider>
                <Footer />
            </GeneralProvider>
        </ErrorBoundaryWrapper>
        </body>
        </html>
    );
}
