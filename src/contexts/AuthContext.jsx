import { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser,
    login as loginService,
    logout as logoutService,
    updateProfile as updateProfileService,
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

    /**
     * Update current user profile.
     */
    async function updateProfile(data) {
        const response =
            await updateProfileService(data);

        setUser(response.user);

        return response;
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
        updateProfile,
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