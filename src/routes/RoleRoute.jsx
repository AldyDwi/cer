import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../constants/roles";

function getHomePath(role) {
  if (role === ROLES.TEACHER) {
    return "/teacher/cer/create";
  }

  if (role === ROLES.STUDENT) {
    return "/student";
  }

  return "/login";
}

function RoleRoute({ children, allowedRoles }) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
}

export { getHomePath };
export default RoleRoute;