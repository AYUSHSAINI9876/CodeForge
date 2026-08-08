import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";

// Gate for pages that require a signed-in user (dashboard, create repo, profile...).
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
};

// Gate for pages that only make sense when signed out (login, signup).
export const PublicOnlyRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};
