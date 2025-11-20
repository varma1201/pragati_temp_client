"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  FileUp,
  CheckCircle,
  Loader,
  ChevronRight,
  BarChart3,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadResponse {
  success: boolean;
  report_id: string;
  extracted_idea: {
    name: string;
    concept: string;
  };
  report: Record<string, any>;
  error?: string;
}

interface FormData {
  user_id: string;
  title: string;
  file: File | null;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    user_id: "",
    title: "",
    file: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiURl = import.meta.env.VITE_API_URI;

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, user_id: e.target.value });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (
        ![
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ].includes(file.type)
      ) {
        toast.error("Please upload a PDF or PPTX file");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setFormData({ ...formData, file });
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.user_id.trim()) {
      toast.error("Please enter a User ID");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a Title");
      return;
    }

    if (!formData.file) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("user_id", formData.user_id.trim());
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("pitch_deck", formData.file);

      const axiosInstance = axios.create({
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      const res = await axiosInstance.post<UploadResponse>(
        `${apiURl}/api/validate-pitch-deck`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setResponse(res.data);
        toast.success("Report generated successfully!");
        setFormData({ user_id: "myname_001", title: "", file: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(res.data.error || "Failed to generate report");
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Pitch Deck Validator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload your pitch deck and get instant AI-powered analysis
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/reports")}
                      className="gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Go to Reports
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View all your generated reports</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Card>
          <CardContent className="pt-6">
            {!response ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User ID Field */}
                <div className="space-y-2">
                  {/* <Label htmlFor="user-id" className="text-sm font-medium"> */}
                  User ID <span className="text-destructive">*</span>
                  {/* </Label> */}
                  <input
                    id="user-id"
                    type="text"
                    value={formData.user_id}
                    onChange={handleUserIdChange}
                    placeholder="e.g., myname_001"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose a unique identifier for your profile
                  </p>
                </div>

                {/* Title Field */}
                <div className="space-y-2">
                  {/* <Label htmlFor="title" className="text-sm font-medium"> */}
                  Project Title <span className="text-destructive">*</span>
                  {/* </Label> */}
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Smart Water Bottle IoT Solution"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a descriptive title for your pitch deck
                  </p>
                </div>

                {/* File Upload Field */}
                <div className="space-y-2">
                  {/* <Label className="text-sm font-medium"> */}
                  Pitch Deck <span className="text-destructive">*</span>
                  {/* </Label> */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="file-input"
                      type="file"
                      accept=".pdf,.pptx"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />

                    {!formData.file ? (
                      <div className="space-y-2">
                        <FileUp className="h-10 w-10 text-muted-foreground mx-auto" />
                        <h3 className="text-lg font-medium">
                          Drop your file here or click to select
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Supported formats: PDF, PPTX (Max 50MB)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <CheckCircle className="h-10 w-10 text-primary mx-auto" />
                        <p className="text-sm font-medium">
                          {formData.file.name}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          disabled={isLoading}
                          className="mt-2"
                        >
                          Change File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Uploading...
                      </span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>

                {/* Features Grid */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold mb-4">
                    What you'll get:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: "📋", label: "Executive Summary" },
                      { icon: "📈", label: "Market Analysis" },
                      { icon: "🚨", label: "Risk Analysis" },
                      { icon: "📊", label: "Benchmarking" },
                      { icon: "💡", label: "Recommendations" },
                      { icon: "✅", label: "Validation Score" },
                    ].map((feature) => (
                      <div
                        key={feature.label}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-xl">{feature.icon}</span>
                        <span className="text-sm font-medium">
                          {feature.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              /* Response Section */
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Report Generated Successfully!
                  </h2>
                </div>

                {/* Extracted Idea */}
                {response.extracted_idea && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        📝 Extracted Idea
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {response.extracted_idea.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Concept:</span>{" "}
                        {response.extracted_idea.concept}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Report Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      🔑 Report Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Report ID:</span>{" "}
                      <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                        {response.report_id}
                      </code>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">User ID:</span>{" "}
                      {formData.user_id}
                    </p>
                  </CardContent>
                </Card>

                {/* Report Summary */}
                {response.report && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        📊 Report Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs">
                        {JSON.stringify(
                          {
                            overall_score: response.report.overall_score,
                            validation_outcome:
                              response.report.validation_outcome,
                            key_sections: Object.keys(response.report).filter(
                              (k) =>
                                ![
                                  "overall_score",
                                  "validation_outcome",
                                  "metadata",
                                ].includes(k)
                            ),
                          },
                          null,
                          2
                        )}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/report/${response.report_id}`)}
                  >
                    View Full Report
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setResponse(null)}>
                    Upload Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
