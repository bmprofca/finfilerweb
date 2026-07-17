import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LOGIN_PATH } from "../constants/routes";
import { GlobalLoadingSkeleton } from "./SkeletonComponent";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GlobalLoadingSkeleton />;
  }

  if (!user) {
    // Redirect to login but save the attempted url
    return <Navigate to={LOGIN_PATH} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;