import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const screeningJobId = searchParams.get("screeningJobId");

    if (!screeningJobId) {
      return NextResponse.json(
        { error: "Missing screening job ID" },
        { status: 400 }
      );
    }

    // Verify user owns this screening job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("screening_jobs")
      .select("user_id")
      .eq("id", screeningJobId)
      .single();

    if (jobError || !job || job.user_id !== user.id) {
      return NextResponse.json(
        { error: "Screening job not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get candidates, ordered by match score (highest first)
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from("candidates")
      .select("*")
      .eq("screening_job_id", screeningJobId)
      .order("match_score", { ascending: false, nullsFirst: false });

    if (candidatesError) {
      console.error("Error fetching candidates:", candidatesError);
      return NextResponse.json(
        { error: "Failed to fetch candidates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      candidates: candidates || [],
    });
  } catch (error) {
    console.error("Get candidates error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

