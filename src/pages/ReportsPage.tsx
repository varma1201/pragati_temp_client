import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Grid3x3,
  List,
  Download,
  Eye,
  Trash2,
  Loader,
  ChevronRight,
  Upload as UploadIcon,
  BarChart3,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateShareableURL } from "@/utils/tokenUtils";

interface Report {
  _id: string;
  reportId: string;
  title?: string; // Make optional
  createdAt?: string; // Make optional
  overallScore?: number; // Make optional
  validationOutcome?: string; // Make optional
  sections?: Record<string, any>;
}

interface ApiResponse {
  success: boolean;
  reports: Report[];
  total: number;
  error?: string;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const apiURl = import.meta.env.VITE_API_URI;

  const fetchReports = useCallback(
    async (userIdToFetch: string) => {
      if (!userIdToFetch.trim()) {
        toast.error("Please enter a User ID");
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await axios.get<ApiResponse>(
          `${apiURl}/api/reports/${userIdToFetch.trim()}`
        );

        if (response?.data?.reports) {
          setReports(response.data.reports);
          setFilteredReports(response.data.reports);
          toast.success(`Found ${response.data.total} report(s)`);
        } else {
          setReports([]);
          setFilteredReports([]);
          toast.error(response.data.error || "No reports found");
        }
      } catch (error: any) {
        console.error("Error:", error);
        setReports([]);
        setFilteredReports([]);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch reports";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [apiURl]
  ); // Remove userId from dependencies

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserId(searchInput); // Still update state for display
    fetchReports(searchInput); // Pass directly to fetch function
  };

  const handleSort = (by: "date" | "score") => {
    setSortBy(by);
    const sorted = [...filteredReports].sort((a, b) => {
      if (by === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return b.overallScore - a.overallScore;
      }
    });
    setFilteredReports(sorted);
  };

  const handleDownloadPDF = async (reportId: string) => {
    try {
      const response = await axios.get(
        `${apiURl}/api/reports/${reportId}/pdf`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await axios.delete(`${apiURl}/api/reports/${reportId}`);
      setReports(reports.filter((r) => r.reportId !== reportId));
      setFilteredReports(
        filteredReports.filter((r) => r.reportId !== reportId)
      );
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const getScoreColor = (score?: number): string => {
    if (!score) return "bg-gray-500";
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOutcomeBadge = (outcome?: string): string => {
    if (!outcome)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    const lower = outcome.toLowerCase();
    if (lower.includes("high"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (lower.includes("moderate"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShareReport = (reportId: string) => {
    const shareableUrl = generateShareableURL(reportId);

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareableUrl)
      .then(() => {
        alert("Shareable link copied to clipboard!");
      })
      .catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = shareableUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Shareable link copied to clipboard!");
      });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    My Validation Reports
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Search and manage all your validation reports
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/")}
                      className="gap-2"
                    >
                      <UploadIcon className="h-4 w-4" />
                      Upload New
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new validation report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
        </Card>

        {/* Search Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter your User ID (e.g., myname_001)"
                  className="pl-9"
                  disabled={isLoading}
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchInput("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <Card>
            <CardContent className="pt-6">
              {/* Header with results count and controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    {isLoading
                      ? "Loading..."
                      : `${filteredReports.length} Report${
                          filteredReports.length !== 1 ? "s" : ""
                        } Found`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userId ? `for user: ${userId}` : ""}
                  </p>
                </div>

                {/* View Mode Toggle & Sort */}
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSort(sortBy === "date" ? "score" : "date")
                          }
                          className="gap-2"
                        >
                          <Filter className="h-4 w-4" />
                          Sort by {sortBy === "date" ? "Date" : "Score"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Sort reports by {sortBy === "date" ? "score" : "date"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setViewMode(viewMode === "grid" ? "list" : "grid")
                          }
                          className="gap-2"
                        >
                          {viewMode === "grid" ? (
                            <List className="h-4 w-4" />
                          ) : (
                            <Grid3x3 className="h-4 w-4" />
                          )}
                          {viewMode === "grid" ? "List" : "Grid"} View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Switch to {viewMode === "grid" ? "list" : "grid"} view
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Reports Grid/List */}
              {!isLoading && filteredReports.length > 0 && (
                <div
                  className={cn(
                    "grid gap-4",
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  )}
                >
                  {filteredReports?.map((report) => (
                    <Card
                      key={report?._id}
                      className={cn(
                        "transition-all p-[1rem] hover:shadow-md cursor-pointer",
                        viewMode === "list" &&
                          "flex items-center justify-between p-4"
                      )}
                      onClick={() => navigate(`/report/${report?._id}`)}
                    >
                      <div
                        className={cn(
                          viewMode === "list" &&
                            "flex items-center gap-4 flex-1"
                        )}
                      >
                        {/* Score Badge */}
                        <div
                          className={cn(
                            "flex items-center justify-center",
                            viewMode === "grid" ? "mb-3" : ""
                          )}
                        >
                          <div
                            className={cn(
                              "w-14 h-14 rounded-full flex items-center justify-center font-bold text-white",
                              getScoreColor(parseInt(report?.overall_score))
                            )}
                          >
                            {parseInt(report?.overall_score)}
                          </div>
                        </div>

                        {/* Content */}
                        <div
                          className={cn(
                            "flex-1",
                            viewMode === "grid" ? "space-y-2" : ""
                          )}
                        >
                          <h4 className="font-semibold text-lg leading-tight">
                            {report?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {report?.validation_outcome}
                          </p>
                          <div
                            className={cn(
                              "flex items-center gap-4 text-xs text-muted-foreground",
                              viewMode === "grid" ? "mt-2" : ""
                            )}
                          >
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(report?.created_at)}
                            </span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                getOutcomeBadge(report?.validationOutcome)
                              )}
                            >
                              {report?.validationOutcome}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          viewMode === "grid" ? "mt-4 pt-4 border-t" : ""
                        )}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/report/${report._id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />{" "}
                                <span className="pr-[1rem]">View</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Report</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPDF(report.reportId);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download PDF</TooltipContent>
                          </Tooltip>
                        </TooltipProvider> */}

                        {/* <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReport(report.reportId);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Report</TooltipContent>
                          </Tooltip>
                        </TooltipProvider> */}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Reports Found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasSearched
                      ? `No reports found for user "${userId}"`
                      : "Enter a User ID to search for reports"}
                  </p>
                  {hasSearched && (
                    <Button onClick={() => navigate("/")}>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Create Your First Report
                    </Button>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading reports...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
