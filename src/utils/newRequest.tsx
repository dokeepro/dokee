import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let token = '';
if (typeof window !== 'undefined') {
    token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1] || '';
}

export const newRequest = axios.create({
    baseURL: `${BACKEND_URL}`,
    timeout: 15000,
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    },
});

export const updateAuthToken = (newToken: string) => {
    newRequest.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
};

if (typeof window !== 'undefined') {
    window.addEventListener('token-updated', (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        updateAuthToken(customEvent.detail);
    });
}
