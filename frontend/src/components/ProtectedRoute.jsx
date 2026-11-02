
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/ProtectedRoute.css";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loader">
        <div className="loader-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
