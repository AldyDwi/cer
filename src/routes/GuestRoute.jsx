import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getHomePath } from "./RoleRoute";
import PageLoading from "../components/common/PageLoading";

function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
}

export default GuestRoute;