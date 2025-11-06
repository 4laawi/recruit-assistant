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

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      // Create profile if doesn't exist
      const { data: newProfile } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: user.id,
          email: user.email!,
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        profile: newProfile,
      });
    }

    // Get additional stats
    const { data: recentJobs } = await supabaseAdmin
      .from("screening_jobs")
      .select("status, total_resumes, processed_resumes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Calculate active screenings
    const activeScreenings = recentJobs?.filter(
      (job) => job.status === "processing" || job.status === "queued"
    ).length || 0;

    // Calculate average processing time for completed jobs
    const completedJobs = recentJobs?.filter(
      (job) => job.status === "completed"
    ) || [];
    
    let avgProcessingTime = "N/A";
    if (completedJobs.length > 0) {
      // Placeholder - you'd calculate this from actual timestamps
      avgProcessingTime = "2.3s";
    }

    return NextResponse.json({
      success: true,
      profile,
      stats: {
        totalResumes: profile?.total_resumes_processed || 0,
        activeScreenings,
        avgProcessingTime,
        monthlyUsage: profile?.monthly_usage_count || 0,
        monthlyLimit: profile?.max_monthly_screenings || 5,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
