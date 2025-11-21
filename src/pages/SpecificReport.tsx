import * as React from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Lightbulb,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Share2,
  Copy,
  Download,
  PlusCircle,
  Send,
  Trash2,
  CalendarIcon,
  ChevronDown,
  Users,
  Target,
  Shield,
  Clock,
  FileText,
  HeartPulse,
  GraduationCap,
  Landmark,
  Leaf,
  ShoppingCart,
  Building2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { cn } from "../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { SpiderChart } from "../components/spider-chart";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import {
  FacebookIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsAppIcon,
  MailIcon,
} from "../components/social-icons";
import { ScoreDisplay } from "../components/score-display";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Roadmap } from "../components/roadmap";
import { ROLES, ROADMAP_PHASES } from "../lib/constants";
import axios from "axios";

// Define types for data structures
interface ParameterSummary {
  avgScore: number;
  strongestPoint: string;
  improvementPoint: string;
}

interface ReportData {
  title: string;
  _id: string;
  validation_outcome: string;
  overall_score: number;
  cluster_scores: Record<string, number>;
  detailed_viability_assessment: {
    clusters: Record<string, Record<string, Record<string, any>>>;
  };
  created_at: string;
}

interface Consultation {
  id: string;
  ideaId: string;
  title: string;
  date: string;
  status: string;
  agenda: string[];
  pointsDiscussed: string[];
  actionItems: Array<{ task: string; owner: string; dueDate: string }>;
  nextSteps: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  credits: number;
  status: "active" | "pending" | "accepted" | "declined";
  hasPsychometricAnalysis: boolean;
  expertise?: string[];
}

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  text: string;
  timestamp: string;
}

// Constants
const STATUS_COLORS: Record<string, string> = {
  Approved: "bg-green-100 text-green-800",
  validation_outcome: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Slay: "bg-purple-100 text-purple-800",
  Mid: "bg-orange-100 text-orange-800",
  Flop: "bg-gray-100 text-gray-800",
};

const domainIcons: Record<string, React.ElementType> = {
  HealthTech: HeartPulse,
  EdTech: GraduationCap,
  FinTech: Landmark,
  Agriculture: Leaf,
  Retail: ShoppingCart,
  "Smart Cities": Building2,
};

const getBackLink = (role: string | null) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return `/dashboard/admin/ideas?role=${role}`;
    case ROLES.COORDINATOR:
      return `/dashboard/coordinator/feedback?role=${role}`;
    default:
      return `/dashboard/ideas?role=${ROLES.INNOVATOR}`;
  }
};

const getScoreColor = (score?: number) => {
  if (score === undefined || score === null) return "text-muted-foreground";
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
};

export default function SpecificReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const ideaId = params.id as string;
  const role = searchParams.get("role");
  const apiUrl = import.meta.env.VITE_API_URI;

  // State with proper types
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  const [topPerformers, setTopPerformers] = React.useState<
    Array<{
      clusterName: string;
      paramName: string;
      name: string;
      score: number;
    }>
  >([]);
  const [bottomPerformers, setBottomPerformers] = React.useState<
    Array<{
      clusterName: string;
      paramName: string;
      name: string;
      score: number;
    }>
  >([]);
  const [avgClusterScores, setAvgClusterScores] = React.useState<
    Array<{
      cluster: string;
      score: number;
    }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Add new state near the top of your component
  const [selectedSubParameter, setSelectedSubParameter] = React.useState<{
    clusterName: string;
    paramName: string;
    subParamName: string;
  } | null>(null);

  const [openParameterItems, setOpenParameterItems] = React.useState<string[]>(
    []
  );
  const highlightTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Add cleanup effect
  React.useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Create click handler
  const handleHighlightClick = (
    clusterName: string,
    paramName: string,
    subParamName: string
  ) => {
    // Clear any existing highlight timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    // Open parent cluster accordion
    setOpenAccordionItems((prev) =>
      prev.includes(clusterName) ? prev : [...prev, clusterName]
    );

    // Open parameter accordion using composite key
    const paramKey = `${clusterName}|${paramName}`;
    setOpenParameterItems((prev) =>
      prev.includes(paramKey) ? prev : [...prev, paramKey]
    );

    // Set selected sub-parameter
    setSelectedSubParameter({ clusterName, paramName, subParamName });

    // Scroll to and highlight the element after accordions animate
    setTimeout(() => {
      const elementId = `sub-param-${subParamName.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Apply visual highlight
        element.classList.add("ring-2", "ring-primary", "bg-primary/5");

        // Auto-remove highlight after 3 seconds
        highlightTimeoutRef.current = setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary", "bg-primary/5");
          setSelectedSubParameter(null);
        }, 3000);
      }
    }, 500);
  };

  // UI State
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMomDialogOpen, setIsMomDialogOpen] = React.useState(false);
  const [selectedConsultationForMom, setSelectedConsultationForMom] =
    React.useState<Consultation | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [activeActionPoint, setActiveActionPoint] = React.useState(0);
  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>(
    []
  );
  const [newComment, setNewComment] = React.useState("");
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [votes, setVotes] = React.useState(27);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);
  const [addMemberType, setAddMemberType] = React.useState<"Member" | "Mentor">(
    "Member"
  );
  const [emailToInvite, setEmailToInvite] = React.useState("");
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] =
    React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<TeamMember | null>(
    null
  );
  const [removalReason, setRemovalReason] = React.useState("");
  const [isRequestConsultationOpen, setIsRequestConsultationOpen] =
    React.useState(false);
  const [isScheduleConsultationOpen, setIsScheduleConsultationOpen] =
    React.useState(false);

  // Refs
  const reportRef = React.useRef<HTMLDivElement>(null);
  const spiderChartRef = React.useRef<HTMLDivElement>(null);

  // Hooks
  const { toast } = useToast();

  // Mock data
  const MOCK_IDEAS = [
    {
      id: ideaId,
      title: reportData?.title || "Loading...",
      description:
        "A comprehensive health monitoring solution using AI to predict and prevent diseases",
      domain: "HealthTech",
      subDomain: "Digital Health",
      status: reportData?.validation_outcome || "Approved",
      innovatorId: "USER-001",
      collegeId: "COLLEGE-001",
      trl: 3,
      clusterWeights: {},
      locality: "Bangalore",
      ttcAssigned: "TTC-001",
      externalMentorId: "USER-002",
      createdAt: "2024-01-15",
    },
  ];

  const MOCK_CONSULTATIONS: Consultation[] = [
    {
      id: "CONS-001",
      ideaId: ideaId,
      title: "Technical Feasibility Review",
      date: "2024-02-15",
      status: "Scheduled",
      agenda: ["Review architecture", "Discuss scalability"],
      pointsDiscussed: [
        "Architecture looks solid",
        "Need to consider cloud costs",
      ],
      actionItems: [
        {
          task: "Prepare cost analysis",
          owner: "Team Lead",
          dueDate: "2024-02-20",
        },
        {
          task: "Research cloud providers",
          owner: "Dev Team",
          dueDate: "2024-02-25",
        },
      ],
      nextSteps: "Schedule follow-up meeting after cost analysis",
    },
    {
      id: "CONS-002",
      ideaId: ideaId,
      title: "Market Research Discussion",
      date: "2024-01-30",
      status: "Completed",
      agenda: ["Target market analysis", "Competitive landscape"],
      pointsDiscussed: [
        "Strong market need identified",
        "Competition is moderate",
      ],
      actionItems: [
        {
          task: "Conduct user interviews",
          owner: "Product Team",
          dueDate: "2024-02-10",
        },
        {
          task: "Analyze competitor pricing",
          owner: "Business Team",
          dueDate: "2024-02-15",
        },
      ],
      nextSteps: "Present findings in next monthly review",
    },
  ];

  const MOCK_TEAM_MEMBERS: TeamMember[] = [
    {
      id: "USER-001",
      name: "Alex Kumar",
      email: "alex.kumar@university.edu",
      collegeId: "COLLEGE-001",
      credits: 150,
      status: "active",
      hasPsychometricAnalysis: true,
    },
    {
      id: "USER-002",
      name: "Priya Sharma",
      email: "priya.sharma@university.edu",
      collegeId: "COLLEGE-001",
      credits: 120,
      status: "active",
      hasPsychometricAnalysis: true,
    },
  ];

  // Fetch data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}/api/report/${ideaId}`);
        const data: ReportData = res.data;
        setReportData(data);

        // Process cluster scores for spider chart
        if (data?.detailed_analysis?.cluster_analyses) {
          const clusterScores = {};

          Object.entries(data.detailed_analysis.cluster_analyses).forEach(
            ([clusterName, clusterData]) => {
              // clusterData.score contains the average score for the cluster
              clusterScores[clusterName] = Math.round(clusterData.score);
            }
          );

          setAvgClusterScores(clusterScores);
        }

        // Process top and bottom performers
        if (data.detailed_viability_assessment?.clusters) {
          const top: Array<{
            clusterName: string;
            paramName: string;
            name: string;
            score: number;
          }> = [];
          const bottom: Array<{
            clusterName: string;
            paramName: string;
            name: string;
            score: number;
          }> = [];

          Object.entries(data.detailed_viability_assessment.clusters).forEach(
            ([clusterName, params]) => {
              Object.entries(params).forEach(([paramName, subParams]) => {
                console.log(params);

                Object.entries(subParams).forEach(([subParamName, data]) => {
                  if (data.assignedScore !== undefined) {
                    const score = data.assignedScore;
                    if (score >= 85) {
                      top.push({
                        clusterName,
                        paramName,
                        name: subParamName,
                        score,
                      });
                    } else if (score < 70) {
                      bottom.push({
                        clusterName,
                        paramName,
                        name: subParamName,
                        score,
                      });
                    }
                  }
                });
              });
            }
          );

          top.sort((a, b) => b.score - a.score);
          bottom.sort((a, b) => a.score - b.score);

          setTopPerformers(top.slice(0, 5));
          setBottomPerformers(bottom.slice(0, 5));
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch report data");
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load report data",
        });
      }
    };

    if (ideaId) {
      fetchData();
    }
  }, [ideaId, apiUrl, toast]);

  console.log(avgClusterScores);

  const idea = MOCK_IDEAS[0];
  const currentPhaseIndex = idea.trl
    ? ROADMAP_PHASES.findIndex((phase) => phase.trls.includes(idea.trl!))
    : -1;
  const currentPhase =
    currentPhaseIndex !== -1 ? ROADMAP_PHASES[currentPhaseIndex] : null;
  const allClusterNames = reportData
    ? Object.keys(reportData.detailed_viability_assessment.clusters)
    : [];
  const allClustersExpanded =
    openAccordionItems.length > 0 &&
    openAccordionItems.length === allClusterNames.length;

  const handleToggleExpandAll = () => {
    if (allClustersExpanded) {
      setOpenAccordionItems([]);
    } else {
      setOpenAccordionItems(allClusterNames);
    }
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const width = pdfWidth;
    const height = width / ratio;

    let position = 0;
    let heightLeft = height;

    pdf.addImage(imgData, "PNG", 0, position, width, height);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - height;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, width, height);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${ideaId}-PragatiAI-Report.pdf`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "The report link has been copied to your clipboard.",
    });
  };

  const handleVote = () => {
    setVotes((prev) => prev + 1);
    toast({ title: "Voted!", description: "Your vote has been counted." });
  };

  const handleSubmitComment = () => {
    if (newComment.trim() === "") return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: "Current User",
      authorEmail: "user@example.com",
      text: newComment,
      timestamp: "Just now",
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    toast({
      title: "Comment Posted",
      description: "Your feedback has been added.",
    });
  };

  const handleViewMom = (consultation: Consultation) => {
    setSelectedConsultationForMom(consultation);
    setIsMomDialogOpen(true);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

  const DomainIcon = idea.domain ? domainIcons[idea.domain] : null;
  const shareUrl = idea
    ? encodeURIComponent(
        `${window.location.origin}/dashboard/ideas/${idea.id}?role=${ROLES.INNOVATOR}`
      )
    : "";
  const shareText = idea
    ? encodeURIComponent(
        `Check out my idea report for "${idea.title}" on PragatiAI!`
      )
    : "";

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !reportData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Error Loading Report</h2>
        <p className="text-muted-foreground mt-2">
          {error || "Report not found"}
        </p>
        {/* <Button asChild className="mt-4">
          <Link to={getBackLink(role)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Link>
        </Button> */}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button> */}
            {/* <div className="ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div> */}
          </div>
        </div>

        {/* Main Report */}
        <div ref={reportRef} className="bg-background">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div>
                <CardTitle className="text-2xl">{reportData.title}</CardTitle>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
                  <span>ID: IDE-{reportData._id?.slice(16, 25)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm text-muted-foreground"
                      >
                        Version: V1.0
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Version History</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        V1.0 -{" "}
                        {new Date(reportData.created_at).toLocaleDateString()}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span>
                    Submitted:{" "}
                    {new Date(reportData.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Status:{" "}
                    <Badge
                      className={cn(
                        STATUS_COLORS[reportData.validation_outcome]
                      )}
                    >
                      {reportData.validation_outcome}
                    </Badge>
                  </span>
                  {/* {idea.domain && (
                    <span className="flex items-center gap-1.5">
                      {DomainIcon && <DomainIcon className="h-4 w-4" />}
                      {idea.domain} {idea.subDomain && `(${idea.subDomain})`}
                    </span>
                  )}
                  {currentPhase && (
                    <Badge variant="secondary">
                      Phase: {currentPhase.name}
                    </Badge>
                  )} */}
                </div>
              </div>
              <ScoreDisplay
                score={reportData.overall_score}
                status={reportData.validation_outcome}
              />
            </CardHeader>

            <CardContent className="space-y-8 pt-2">
              {/* Roadmap */}
              {idea.trl && (
                <>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>Project Roadmap</span>
                      </CardTitle>
                      <CardDescription>
                        Your idea's current position on the path from concept to
                        market.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* {reportData.roadmap && ( */}
                      <Roadmap
                        currentTrl={reportData.roadmap.current_trl}
                        role={role || ROLES.INNOVATOR}
                        keyActivities={reportData.roadmap.key_activities} // ✅ Now actually used!
                      />
                      {/* // )} */}
                    </CardContent>
                  </Card>
                  <Separator />
                </>
              )}

              {/* Spider Chart and Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Cluster Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Average scores across the main evaluation clusters.
                  </p>
                  <div
                    ref={spiderChartRef}
                    className="h-[350px] flex items-center justify-center"
                  >
                    <SpiderChart
                      data={avgClusterScores}
                      maxScore={100}
                      size={400}
                    />
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Highlights & Lowlights
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Top and bottom performing sub-parameters.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        <TrendingUp /> Top Performers
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        {topPerformers.length > 0 ? (
                          topPerformers.map((item, i) => (
                            <li key={i}>
                              <button
                                onClick={() =>
                                  handleHighlightClick(
                                    item.clusterName,
                                    item.paramName,
                                    item.name
                                  )
                                }
                                className="flex justify-between w-full hover:bg-muted p-3 rounded-md transition-colors cursor-pointer text-left group"
                              >
                                <span className="text-muted-foreground group-hover:text-foreground">
                                  {item.name}
                                </span>
                                <span className="font-bold text-green-600">
                                  {item.score}
                                </span>
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground">
                            No top performers found
                          </li>
                        )}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <TrendingDown /> Areas for Improvement
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        {bottomPerformers.length > 0 ? (
                          bottomPerformers.map((item, i) => (
                            <li key={i}>
                              <button
                                onClick={() =>
                                  handleHighlightClick(
                                    item.clusterName,
                                    item.paramName,
                                    item.name
                                  )
                                }
                                className="flex justify-between w-full hover:bg-muted p-3 rounded-md transition-colors cursor-pointer text-left group"
                              >
                                <span className="text-muted-foreground group-hover:text-foreground">
                                  {item.name}
                                </span>
                                <span className="font-bold text-red-600">
                                  {item.score}
                                </span>
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground">
                            No low performers found
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Points */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Next Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Actionable steps to improve your idea based on the evaluation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="flex flex-col gap-2">
                    {bottomPerformers.length > 0 ? (
                      bottomPerformers.slice(0, 3).map((point, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveActionPoint(i)}
                          className={cn(
                            "p-3 rounded-md text-left transition-colors border-l-4",
                            i === activeActionPoint
                              ? "bg-muted border-primary"
                              : "bg-transparent hover:bg-muted/50 border-transparent"
                          )}
                        >
                          <p className="font-semibold">Improve: {point.name}</p>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 rounded-md bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          No specific action items identified
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Recommended Actions:</h4>
                    {bottomPerformers[activeActionPoint] ? (
                      <div className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>
                            Review feedback for "
                            {bottomPerformers[activeActionPoint].name}"
                          </span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Brainstorm improvement strategies</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>Update pitch deck accordingly</span>
                        </li>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Continue with current strategy
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detailed Assessment */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Detailed Viability Assessment
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive evaluation of all parameters across multiple
                      clusters
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleToggleExpandAll}
                  >
                    {allClustersExpanded ? "Collapse All" : "Expand All"}
                  </Button>
                </div>
                <Accordion
                  type="multiple"
                  value={openAccordionItems}
                  onValueChange={setOpenAccordionItems}
                  className="w-full pt-4"
                >
                  {reportData.detailed_viability_assessment.clusters &&
                    Object.entries(
                      reportData.detailed_viability_assessment.clusters
                    ).map(([clusterName, clusterData]) => (
                      <AccordionItem value={clusterName} key={clusterName}>
                        <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                          {clusterName}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0 space-y-4">
                          <Accordion
                            type="multiple"
                            value={openParameterItems}
                            onValueChange={setOpenParameterItems}
                            className="w-full"
                          >
                            {Object.entries(clusterData).map(
                              ([paramName, paramData]) => {
                                if (
                                  typeof paramData !== "object" ||
                                  paramData === null
                                )
                                  return null;

                                const scores = Object.values(paramData)
                                  .filter(
                                    (p) =>
                                      typeof p === "object" &&
                                      p !== null &&
                                      p.assignedScore !== undefined
                                  )
                                  .map((p) => p.assignedScore);

                                const categoryAverage =
                                  scores.length > 0
                                    ? Math.round(
                                        (scores.reduce((a, b) => a + b, 0) /
                                          scores.length) *
                                          100
                                      ) / 100
                                    : 0;

                                const paramKey = `${clusterName}|${paramName}`;

                                return (
                                  <AccordionItem
                                    value={paramKey}
                                    key={paramKey}
                                  >
                                    <AccordionTrigger className="font-semibold mb-2 hover:no-underline">
                                      <div className="flex justify-between items-center w-full pr-2">
                                        <span>{paramName}</span>
                                        <span
                                          className={cn(
                                            "flex items-center justify-center text-base font-bold",
                                            getScoreColor(
                                              parseInt(categoryAverage)
                                            )
                                          )}
                                        >
                                          {parseInt(categoryAverage)}
                                        </span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="divide-y">
                                        {Object.entries(paramData).map(
                                          ([subParamName, subParamData]) => {
                                            if (
                                              typeof subParamData !==
                                                "object" ||
                                              subParamData === null ||
                                              subParamData.assignedScore ===
                                                undefined
                                            )
                                              return null;

                                            const score =
                                              subParamData.assignedScore;
                                            const whatWentWell =
                                              subParamData.whatWentWell ||
                                              "No data";
                                            const whatCanBeImproved =
                                              subParamData.whatCanBeImproved ||
                                              "No data";
                                            const elementId = `sub-param-${subParamName.replace(
                                              /[^a-zA-Z0-9]/g,
                                              "-"
                                            )}`;

                                            const subCircumference =
                                              2 * Math.PI * 18;
                                            const subStrokeDashoffset =
                                              subCircumference -
                                              (score / 100) * subCircumference;

                                            const isHighlighted =
                                              selectedSubParameter?.clusterName ===
                                                clusterName &&
                                              selectedSubParameter?.paramName ===
                                                paramName &&
                                              selectedSubParameter?.subParamName ===
                                                subParamName;

                                            return (
                                              <div
                                                key={subParamName}
                                                id={elementId}
                                                className={cn(
                                                  "p-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center scroll-mt-20 transition-all duration-300",
                                                  isHighlighted &&
                                                    "ring-2 ring-primary bg-primary/5"
                                                )}
                                              >
                                                <div className="md:col-span-3">
                                                  <h6 className="font-medium text-sm">
                                                    {subParamName}
                                                  </h6>
                                                </div>
                                                <div className="md:col-span-1 flex items-center justify-start md:justify-center">
                                                  <div className="relative h-16 w-16">
                                                    <svg
                                                      className="h-full w-full"
                                                      viewBox="0 0 40 40"
                                                    >
                                                      <circle
                                                        cx="20"
                                                        cy="20"
                                                        r="18"
                                                        className="stroke-muted"
                                                        strokeWidth="3"
                                                        fill="transparent"
                                                      />
                                                      <circle
                                                        cx="20"
                                                        cy="20"
                                                        r="18"
                                                        className={cn(
                                                          "stroke-current transition-all duration-500 ease-in-out",
                                                          getScoreColor(score)
                                                        )}
                                                        strokeWidth="3"
                                                        fill="transparent"
                                                        strokeLinecap="round"
                                                        strokeDasharray={
                                                          subCircumference
                                                        }
                                                        strokeDashoffset={
                                                          subStrokeDashoffset
                                                        }
                                                        transform="rotate(-90 20 20)"
                                                      />
                                                    </svg>
                                                    <span
                                                      className={cn(
                                                        "absolute inset-0 flex items-center justify-center text-base font-bold",
                                                        getScoreColor(score)
                                                      )}
                                                    >
                                                      {score}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="md:col-span-4 space-y-1">
                                                  <div className="flex items-start gap-2 text-sm">
                                                    <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                    <p className="text-muted-foreground flex-1 break-words">
                                                      {whatWentWell}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="md:col-span-4 space-y-1">
                                                  <div className="flex items-start gap-2 text-sm">
                                                    <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                    <p className="text-muted-foreground flex-1 break-words">
                                                      {whatCanBeImproved}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                );
                              }
                            )}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Report: {idea.title}</DialogTitle>
              <DialogDescription>
                Share your idea report with others via link or PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Input id="link" value={window.location.href} readOnly />
                <Button type="button" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this link will be able to view the report.
              </p>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-center text-muted-foreground">
                  Quick Share
                </p>
                <div className="flex justify-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://api.whatsapp.com/send?text=${shareText} ${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TwitterIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>X / Twitter</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FacebookIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Facebook</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(
                            idea.title || ""
                          )}&summary=${shareText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkedInIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>LinkedIn</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`mailto:?subject=${encodeURIComponent(
                            idea.title || ""
                          )}&body=${shareText} ${shareUrl}`}
                        >
                          <MailIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDownload}
              >
                <Download className="mr-2" />
                Export as PDF
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
