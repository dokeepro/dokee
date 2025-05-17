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
    timeout: 5000,
    withCredentials: true,
    headers: {
        Authorization: `Bearer ${token}`,
    },
});