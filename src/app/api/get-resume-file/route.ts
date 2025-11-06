import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Validate required environment variables
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required. Please check your environment variables."
    );
  }
  return url;
}

function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required. Please check your environment variables."
    );
  }
  return key;
}

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get candidate ID from query params
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");

    if (!candidateId) {
      return NextResponse.json(
        { error: "Missing candidate ID" },
        { status: 400 }
      );
    }

    // Get candidate record
    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from("candidates")
      .select("screening_job_id, file_path, filename")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Verify user owns the screening job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("screening_jobs")
      .select("user_id")
      .eq("id", candidate.screening_job_id)
      .single();

    if (jobError || !job || job.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - you don't own this candidate's screening job" },
        { status: 403 }
      );
    }

    if (!candidate.file_path) {
      return NextResponse.json(
        { error: "File path not found for this candidate" },
        { status: 404 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(candidate.file_path, 3600); // 1 hour

    if (urlError || !signedUrlData) {
      console.error("Error creating signed URL:", urlError);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedUrlData.signedUrl,
      filename: candidate.filename,
    });
  } catch (error) {
    console.error("Get resume file error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
