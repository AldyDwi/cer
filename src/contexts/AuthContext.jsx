import { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser,
    login as loginService,
    logout as logoutService,
} from "../features/auth/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Check authenticated user when application starts.
     */
    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const response = await getCurrentUser();

            setUser(response.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Login user.
     */
    async function login(username, password) {
        const response = await loginService(username, password);

        setUser(response.user);

        return response;
    }

    /**
     * Logout current user.
     */
    async function logout() {
        try {
            await logoutService();
        } finally {
            setUser(null);
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Access authentication context.
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth harus digunakan di dalam AuthProvider."
        );
    }

    return context;
}