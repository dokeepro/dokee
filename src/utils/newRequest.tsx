// lib/api.ts
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let token = '';
// Check if window is defined to ensure this code only runs in the browser
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

// Function to update the token in the newRequest instance
// This is useful if the token changes after initial load (e.g., after login)
export const updateAuthToken = (newToken: string) => {
    newRequest.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
};

// Listen for token changes (e.g., from a login component)
// This is a simplified example; in a real app, you might use a state management library
// or a custom event to notify about token changes.
if (typeof window !== 'undefined') {
    window.addEventListener('token-updated', (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        updateAuthToken(customEvent.detail);
    });
}
