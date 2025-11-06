// API helper functions for making authenticated requests

import { supabase } from "./supabaseClient";
import { ScreeningJob, Candidate, StartScreeningRequest } from "@/types/database";

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return `Bearer ${session.access_token}`;
}

export async function uploadResume(
  file: File,
  screeningJobId: string
): Promise<{ fileId: string; fileName: string; filePath: string }> {
  const authHeader = await getAuthHeader();
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("screeningJobId", screeningJobId);

  const response = await fetch("/api/upload-resume", {
    method: "POST",
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload resume");
  }

  return response.json();
}

export async function startScreening(
  data: StartScreeningRequest
): Promise<{ jobId: string; message: string; estimatedTime: string }> {
  const authHeader = await getAuthHeader();

  const response = await fetch("/api/start-screening", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start screening");
  }

  return response.json();
}

export async function getScreeningJobs(
  limit: number = 10,
  status?: string
): Promise<ScreeningJob[]> {
  const authHeader = await getAuthHeader();

  const params = new URLSearchParams({ limit: limit.toString() });
  if (status) params.append("status", status);

  const response = await fetch(`/api/get-screening-jobs?${params}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch screening jobs");
  }

  const data = await response.json();
  return data.jobs;
}

export async function getCandidates(
  screeningJobId: string
): Promise<Candidate[]> {
  const authHeader = await getAuthHeader();

  const response = await fetch(
    `/api/get-candidates?screeningJobId=${screeningJobId}`,
    {
      headers: {
        Authorization: authHeader,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch candidates");
  }

  const data = await response.json();
  return data.candidates;
}

interface UserProfile {
  id: string
  email: string
  full_name?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  total_screenings_count: number
  total_resumes_processed: number
  monthly_usage_count: number
  usage_reset_date: string
  max_monthly_screenings: number
  max_resumes_per_screening: number
  created_at: string
  updated_at: string
}

export async function getUserStats(): Promise<{
  profile: UserProfile | null;
  stats: {
    totalResumes: number;
    activeScreenings: number;
    avgProcessingTime: string;
    monthlyUsage: number;
    monthlyLimit: number;
  };
}> {
  try {
    const authHeader = await getAuthHeader();

    const response = await fetch("/api/get-user-stats", {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || "Failed to fetch user stats");
    }

    const data = await response.json();
    
    // Ensure the response has the expected structure
    if (!data.stats) {
      console.error('Invalid stats response:', data);
      throw new Error('Invalid response structure');
    }
    
    return data;
  } catch (error) {
    console.error('getUserStats error:', error);
    throw error;
  }
}

export async function deleteScreeningJob(jobId: string): Promise<void> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`/api/delete-screening-job?jobId=${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete screening job");
  }

  return response.json();
}

export async function getResumeFileUrl(
  candidateId: string
): Promise<{ signedUrl: string; filename: string }> {
  const authHeader = await getAuthHeader();

  const response = await fetch(
    `/api/get-resume-file?candidateId=${candidateId}`,
    {
      headers: {
        Authorization: authHeader,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get resume file");
  }

  const data = await response.json();
  return {
    signedUrl: data.signedUrl,
    filename: data.filename,
  };
}

// Helper to create a temporary screening job ID for file uploads
export function createTempScreeningJobId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
