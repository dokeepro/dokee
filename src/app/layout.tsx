// app/layout.tsx or wherever
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import PageWrapper from "@/sections/page-wrapper/PageWrapper";
import Popup, {PopupProvider} from "@/context/PopupContext";
import React from "react";
import {AlertProvider} from "@/context/AlertContext";
import {withGeneralContext} from "@/context/withGeneralContext";
import {DocumentProvider} from "@/context/DocumentContext";

type RootLayoutProps = {
    children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({children}) => {
    return (
        <html lang="en">
        <body>
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
        </body>
        </html>
    );
};

export default withGeneralContext(RootLayout);
