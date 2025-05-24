"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {Dialog, IconButton} from '@mui/material';
import { LiaTimesSolid } from "react-icons/lia";
interface PopupContextProps {
    isOpen: boolean;
    openPopup: (content: ReactNode) => void;
    closePopup: () => void;
    content: ReactNode;
}

const PopupContext = createContext<PopupContextProps | undefined>(undefined);

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode>(null);

    const openPopup = (popupContent: ReactNode) => {
        setContent(popupContent);
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
        setContent(null);
    };

    return (
        <PopupContext.Provider value={{ isOpen, openPopup, closePopup, content }}>
            {children}
        </PopupContext.Provider>
    );
};

export const usePopup = (): PopupContextProps => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};

const Popup: React.FC = () => {
    const { isOpen, closePopup, content } = usePopup();

    return (
        <Dialog open={isOpen} onClose={closePopup} maxWidth="sm" fullWidth>
            <div style={{ backgroundColor: 'white', position: "relative", padding: '20px', borderRadius: '8px' }}>
                <div style={{position: "absolute", top: "3%", right: "3%"}} onClick={closePopup}>
                    <IconButton>
                        <LiaTimesSolid/>
                    </IconButton>
                </div>
                {content}
            </div>
        </Dialog>
    );
};

export default Popup;