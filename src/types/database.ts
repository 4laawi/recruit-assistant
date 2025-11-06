// Database types matching Supabase schema

export interface ScreeningJob {
  id: string;
  user_id: string;
  job_title: string;
  required_skills: string[];
  years_experience: string;
  work_location: string;
  location?: string;
  job_description?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  total_resumes: number;
  processed_resumes: number;
  failed_resumes: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface Candidate {
  id: string;
  screening_job_id: string;
  filename: string;
  file_path?: string;
  file_size?: number;
  ocr_text?: string;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_analysis?: AIAnalysis;
  match_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
  summary?: string;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  years_of_experience?: number;
  top_skills?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  processed_at?: string;
}

export interface AIAnalysis {
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  extracted_info: {
    name?: string;
    email?: string;
    phone?: string;
    years_experience?: number;
    skills: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  total_screenings_count: number;
  total_resumes_processed: number;
  monthly_usage_count: number;
  usage_reset_date: string;
  max_monthly_screenings: number;
  max_resumes_per_screening: number;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface StartScreeningRequest {
  jobTitle: string;
  requiredSkills: string[];
  yearsExperience: string;
  workLocation: string;
  location?: string;
  jobDescription?: string;
  fileIds: string[]; // IDs of uploaded files
}

export interface StartScreeningResponse {
  jobId: string;
  message: string;
  estimatedTime: string;
}

export interface UploadResumeResponse {
  fileId: string;
  fileName: string;
  filePath: string;
}
