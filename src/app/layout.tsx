import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import PageWrapper from "@/sections/page-wrapper/PageWrapper";
import Popup, {PopupProvider} from "@/context/PopupContext";
import React from "react";
import {AlertProvider} from "@/context/AlertContext";
import {GeneralProvider} from "@/context/GeneralContext";

export async function generateMetadata() {
    const title = "Dokee - Быстрый перевод документов";
    const description = "Dokee - это сервис по переводу стандартных документов личного характера, которыми пользуется каждый гражданин. Мы ориентируемся на минимальную затрату времени для согласования заказа. Всего в 3 клика Вы сможете узнать стоимость перевода документа и знать точную дату его получения.";
    const ogImage = `https://dokee-blush.vercel.app/images/dokee-logo.jpg`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://dokee-blush.vercel.app`,
            type: 'website',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    };
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <Header/>
            <PageWrapper>
                <PopupProvider>
                    <AlertProvider>
                        <GeneralProvider>
                            <Popup/>
                            {children}
                        </GeneralProvider>
                    </AlertProvider>
                </PopupProvider>
            </PageWrapper>
        <Footer/>
        </body>
        </html>
    );
}
