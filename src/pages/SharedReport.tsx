import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpecificReportPage from "./SpecificReport";
import { validateReportToken, clearTokenFromURL } from "../utils/tokenUtils";

const SharedReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token || !validateReportToken()) {
      navigate("/", { replace: true });
      return;
    }

    setIsValid(true);
    setIsLoading(false);

    // Optional: Clear token from URL for cleaner appearance
    // Uncomment the line below if you want to hide the token after validation
    // clearTokenFromURL();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Validating access...</div>
      </div>
    );
  }

  if (!isValid) {
    return null; // Navigate will handle redirect
  }

  return <SpecificReportPage />;
};

export default SharedReport;
