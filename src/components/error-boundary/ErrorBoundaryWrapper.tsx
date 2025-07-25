"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
    children: React.ReactNode;
}

export default function ErrorBoundaryWrapper({ children }: Props) {
    const router = useRouter();

    useEffect(() => {
        const errorHandler = (event: ErrorEvent) => {
            if (event.message.includes("Invalid URL")) {
                console.warn("Caught Invalid URL error — redirecting to home.");
                router.replace("/");
            }
        };

        window.addEventListener("error", errorHandler);

        return () => {
            window.removeEventListener("error", errorHandler);
        };
    }, [router]);

    return <>{children}</>;
}
