'use client';
import { useEffect } from 'react';

const WayforpayScript = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://secure.wayforpay.com/server/pay-widget.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return null;
};

export default WayforpayScript;
