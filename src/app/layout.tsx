import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import PageWrapper from "@/sections/page-wrapper/PageWrapper";
import Popup, {PopupProvider} from "@/context/PopupContext";
import React from "react";
import {AlertProvider} from "@/context/AlertContext";
import {DocumentProvider} from "@/context/DocumentContext";
import {GeneralProvider} from "@/context/GeneralContext";
import WayforpayScript from "@/utils/WayforpayScript";
import ErrorBoundaryWrapper from "@/components/error-boundary/ErrorBoundaryWrapper";
import {getInitialGeneralData} from "@/utils/getInitialGeneralData";
import type {Metadata} from "next";

export const generateMetadata = async (): Promise<Metadata> => ({
    title: "Dokee — сервис для перевода документов",
    description: "Dokee — сервис для перевода документов на любые доступные языки.",
    openGraph: {
        title: "Dokee — сервис для перевода документов",
        description: "Переводите паспорта, справки и другие документы на любые языки быстро и удобно.",
        url: "https://dokee.pro",
        siteName: "Dokee",
        images: [
            {
                url: "https://dokee.pro/dokee-logo.jpg",
                width: 1200,
                height: 630,
                alt: "Dokee — сервис для перевода документов",
            },
        ],
        locale: "ru_RU",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Dokee — сервис для перевода документов",
        description: "Переводите паспорта, справки и другие документы на любые языки быстро и удобно.",
        images: ["https://dokee.pro/dokee-logo.jpg"],
    },
    icons: {
        icon: "/favicon.ico",
    },
});

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const {documents, general} = await getInitialGeneralData();

    return (
        <html lang="en">
        <body>
        <ErrorBoundaryWrapper>
            <WayforpayScript/>
            <GeneralProvider initialDocuments={documents} initialGeneral={general}>
                <Header/>
                <DocumentProvider>
                    <PageWrapper>
                        <PopupProvider>
                            <AlertProvider>
                                <Popup/>
                                {children}
                            </AlertProvider>
                        </PopupProvider>
                    </PageWrapper>
                </DocumentProvider>
                <Footer/>
            </GeneralProvider>
        </ErrorBoundaryWrapper>
        </body>
        </html>
    );
}
