import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import PageWrapper from "@/sections/page-wrapper/PageWrapper";
import Popup, {PopupProvider} from "@/context/PopupContext";
import React from "react";
import {AlertProvider} from "@/context/AlertContext";
import {DocumentProvider} from "@/context/DocumentContext";
import { GeneralProvider } from "@/context/GeneralContext";
import WayforpayScript from "@/utils/WayforpayScript";

type RootLayoutProps = {
    children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({children}) => {
    return (
        <html lang="en">
        <body>
        <WayforpayScript/>
        <GeneralProvider>
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
        </body>
        </html>
    );
};

export default RootLayout;

