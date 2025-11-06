import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { StartScreeningRequest } from "@/types/database";

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

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body: StartScreeningRequest = await req.json();
    const {
      jobTitle,
      requiredSkills,
      yearsExperience,
      workLocation,
      location,
      jobDescription,
      fileIds,
    } = body;

    // Validate required fields
    if (!jobTitle || !requiredSkills || !yearsExperience || !workLocation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!fileIds || fileIds.length === 0) {
      return NextResponse.json(
        { error: "No resumes uploaded" },
        { status: 400 }
      );
    }

    // Check user's subscription limits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      // Create profile if doesn't exist
      await supabaseAdmin.from("user_profiles").insert({
        id: user.id,
        email: user.email!,
      });
    } else {
      // Check limits
      if (profile.monthly_usage_count >= profile.max_monthly_screenings) {
        return NextResponse.json(
          {
            error: `Monthly screening limit reached (${profile.max_monthly_screenings}). Please upgrade your plan.`,
          },
          { status: 403 }
        );
      }

      if (fileIds.length > profile.max_resumes_per_screening) {
        return NextResponse.json(
          {
            error: `Too many resumes. Your plan allows up to ${profile.max_resumes_per_screening} resumes per screening.`,
          },
          { status: 403 }
        );
      }
    }

    // Create screening job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("screening_jobs")
      .insert({
        user_id: user.id,
        job_title: jobTitle,
        required_skills: requiredSkills,
        years_experience: yearsExperience,
        work_location: workLocation,
        location: location || null,
        job_description: jobDescription || null,
        status: "queued",
        total_resumes: fileIds.length,
        processed_resumes: 0,
        failed_resumes: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error("Error creating screening job:", jobError);
      return NextResponse.json(
        { error: "Failed to create screening job" },
        { status: 500 }
      );
    }

    // Create candidate records for each uploaded file
    const candidateRecords = fileIds.map((fileId) => {
      const fileName = fileId.split("/").pop() || fileId;
      return {
        screening_job_id: job.id,
        filename: fileName,
        file_path: fileId,
        ocr_status: "pending",
        status: "pending",
      };
    });

    const { error: candidatesError } = await supabaseAdmin
      .from("candidates")
      .insert(candidateRecords);

    if (candidatesError) {
      console.error("Error creating candidate records:", candidatesError);
      // Rollback: delete the screening job
      await supabaseAdmin.from("screening_jobs").delete().eq("id", job.id);
      return NextResponse.json(
        { error: "Failed to create candidate records" },
        { status: 500 }
      );
    }

    // Update user profile usage
    await supabaseAdmin
      .from("user_profiles")
      .update({
        monthly_usage_count: (profile?.monthly_usage_count || 0) + 1,
        total_screenings_count: (profile?.total_screenings_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Trigger background processing (fire and forget)
    const baseUrl = req.nextUrl.origin;
    fetch(`${baseUrl}/api/process-screening-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ jobId: job.id }),
    }).catch((error) => {
      console.error("Failed to trigger background processing:", error);
    });

    // Calculate estimated time (30-40 seconds per resume)
    const estimatedSeconds = fileIds.length * 35;
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
    const estimatedTime =
      estimatedMinutes < 2
        ? `${estimatedSeconds} seconds`
        : `${estimatedMinutes} minutes`;

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: "Screening started successfully!",
      estimatedTime,
    });
  } catch (error) {
    console.error("Start screening error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
