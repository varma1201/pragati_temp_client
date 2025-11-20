import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { validateReportToken } from "../utils/tokenUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowPublicAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowPublicAccess = false,
}) => {
  const location = useLocation();
  const isSharedReport = location.pathname.startsWith("/shared-report/");

  // Allow access if it's a shared report with valid token
  if (allowPublicAccess && isSharedReport && validateReportToken()) {
    return <>{children}</>;
  }

  // Check if user is authenticated (your existing auth logic)
  const isAuthenticated = !!localStorage.getItem("userToken");

  if (!isAuthenticated && !isSharedReport) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
