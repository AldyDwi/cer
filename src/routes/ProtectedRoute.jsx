import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
    const {
        loading,
        isAuthenticated,
    } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream-light">
                <div className="text-sm font-medium text-dark">
                    Memuat...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;