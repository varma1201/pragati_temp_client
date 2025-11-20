import { v4 as uuidv4 } from "uuid";

// Generate a secure token for report sharing
export const generateReportToken = (): string => {
  return uuidv4();
};

// Validate token in URL
export const validateReportToken = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const reportId = params.get("reportId");

  // Check if token exists and matches expected format
  if (!token || !reportId) return false;

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
};

// Clear token from URL after validation
export const clearTokenFromURL = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, document.title, url.toString());
};

// Generate shareable URL
export const generateShareableURL = (reportId: string): string => {
  const token = generateReportToken();
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared-report/${reportId}?token=${token}`;
};
