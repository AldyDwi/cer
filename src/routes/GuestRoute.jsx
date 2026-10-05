import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getHomePath } from "./RoleRoute";

function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-light">
        <div className="text-sm font-medium text-dark">
          Memuat...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
}

export default GuestRoute;