import axios from "axios";
import api from "../../../services/api";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function getCsrfCookie() {
    await axios.get(
        `${backendUrl}/sanctum/csrf-cookie`,
        {
            withCredentials: true,
        }
    );
}

export async function login(username, password) {
    await getCsrfCookie();

    const response = await api.post("/login", {
        username,
        password,
    });

    return response.data;
}

export async function logout() {
    const response = await api.post("/logout");

    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/user");

    return response.data;
}