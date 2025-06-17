"use client";

import React, { createContext, useContext, useState } from "react";

type VisibilityContextType = {
    isCalculatorVisible: boolean;
    setIsCalculatorVisible: (value: boolean) => void;
};

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export const VisibilityProvider = ({ children }: { children: React.ReactNode }) => {
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

    return (
        <VisibilityContext.Provider value={{ isCalculatorVisible, setIsCalculatorVisible }}>
            {children}
        </VisibilityContext.Provider>
    );
};

export const useVisibilityContext = () => {
    const context = useContext(VisibilityContext);
    if (!context) {
        throw new Error("useVisibilityContext must be used within VisibilityProvider");
    }
    return context;
};
