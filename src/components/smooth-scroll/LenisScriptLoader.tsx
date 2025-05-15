"use client";

import React, { useEffect } from 'react';

declare global {
    interface Window {
        Lenis: new (options: LenisOptions) => LenisInstance;
    }
}

interface LenisOptions {
    duration: number;
    easing: (t: number) => number;
    direction: 'vertical' | 'horizontal';
    gestureDirection: 'vertical' | 'horizontal';
    smooth: boolean;
    mouseMultiplier: number;
    smoothTouch: boolean;
    touchMultiplier: number;
    infinite: boolean;
}

interface LenisInstance {
    on: (event: string, callback: (params: ScrollEventParams) => void) => void;
    raf: (time: number) => void;
}

interface ScrollEventParams {
    scroll: number;
    limit: number;
    velocity: number;
    direction: number;
    progress: number;
}

const LenisScriptLoader: React.FC = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/gh/studio-freight/lenis@0.2.28/bundled/lenis.js";
        script.async = true;
        script.onload = () => {
            const lenis = new window.Lenis({
                duration: 1.7,
                easing: (t: number) => Math.min(2, 1.001 - Math.pow(2, -20 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });

            lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }: ScrollEventParams) => {
                console.log({ scroll, limit, velocity, direction, progress });
            });

            function raf(time: number) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
        };
        document.body.appendChild(script);
    }, []);

    return null;
};

export default LenisScriptLoader;