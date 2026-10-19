import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true',
        "ngrok-skip-browser-warning": "69420"
    },
});

export default api;