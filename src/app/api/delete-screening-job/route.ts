import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Runtime Supabase client creation to prevent build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Required environment variables are missing. Please check your environment variables.');
  }
  
  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    // Create Supabase client at runtime
    const supabaseAdmin = getSupabaseClient();
    
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

    // Get job ID from query params
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing job ID" },
        { status: 400 }
      );
    }

    // Verify user owns this screening job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("screening_jobs")
      .select("user_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Screening job not found" },
        { status: 404 }
      );
    }

    if (job.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - you don't own this screening job" },
        { status: 403 }
      );
    }

    // Get all candidate file paths before deletion
    const { data: candidates } = await supabaseAdmin
      .from("candidates")
      .select("file_path")
      .eq("screening_job_id", jobId);

    // Delete all resume files from Storage
    if (candidates && candidates.length > 0) {
      const filePaths = candidates
        .map(c => c.file_path)
        .filter(path => path); // Remove null/undefined

      if (filePaths.length > 0) {
        console.log(`Deleting ${filePaths.length} files from Storage...`);
        
        // Delete files in batches
        const { error: storageError } = await supabaseAdmin.storage
          .from("resumes")
          .remove(filePaths);

        if (storageError) {
          console.error("Error deleting files from storage:", storageError);
          // Continue anyway - database cleanup is more important
        } else {
          console.log("✅ Files deleted from Storage");
        }
      }
    }

    // Delete the screening job (this will CASCADE delete all candidates)
    const { error: deleteError } = await supabaseAdmin
      .from("screening_jobs")
      .delete()
      .eq("id", jobId);

    if (deleteError) {
      console.error("Error deleting screening job:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete screening job", details: deleteError.message },
        { status: 500 }
      );
    }

    // Update user stats (decrement screening count)
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("total_screenings_count")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabaseAdmin
        .from("user_profiles")
        .update({
          total_screenings_count: Math.max(0, profile.total_screenings_count - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    console.log(`✅ Successfully deleted screening job ${jobId} and all associated data`);

    return NextResponse.json({
      success: true,
      message: "Screening job and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete screening job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
