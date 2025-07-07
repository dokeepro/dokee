"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlert from '@/components/alert/Alert';

interface AlertContextProps {
    showAlert: (message: string, severity: 'error' | 'warning' | 'info' | 'success', title?: string) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'error' | 'warning' | 'info' | 'success'; title?: string }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showAlert = (message: string, severity: 'error' | 'warning' | 'info' | 'success', title?: string) => {
        setAlert({ open: true, message, severity, title });
    };

    const handleClose = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <CustomAlert
                open={alert.open}
                onClose={handleClose}
                severity={alert.severity}
                message={alert.message}
                title={alert.title}
            />
        </AlertContext.Provider>
    );
};