export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  education?: string;
  interests?: string[];
  preferredCareer?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ReportData {
  skills: string[];
  weaknesses: string[];
  personality: string;
  recommendedCareers: {
    title: string;
    match: number;
    description: string;
  }[];
  requiredSkills: string[];
  estimatedTime: string;
  realityCheck: string;
  roadmap: {
    step: number;
    title: string;
    description: string;
    duration: string;
  }[];
  confidenceScore: number;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
}
