import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../constants/roles";
import PageLoading from "../components/common/PageLoading";

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
    return <PageLoading />;
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