import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLoading from "../components/common/PageLoading";

function ProtectedRoute({ children }) {
    const {
        loading,
        isAuthenticated,
    } = useAuth();

    if (loading) {
        return <PageLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;