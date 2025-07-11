import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingScreen from "../../common/loading";

const ADMIN_EMAIL = "keshav.bit12312015@iiitsonepat.ac.in";

const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Restrict /admin route to only the allowed email
  if (
    location.pathname.startsWith("/admin") &&
    user?.email?.toLowerCase() !== ADMIN_EMAIL
  ) {
    return <Navigate to="/" replace />;
  }

  // Render protected content if authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
