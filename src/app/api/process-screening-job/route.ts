import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ScreeningJob, Candidate } from "@/types/database";
import { analyzeResumeWithFallback, extractTextWithFallback } from "@/lib/services/fallbacks";

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

export const maxDuration = 300; // 5 minutes max execution time

async function convertPDFToBase64(filePath: string): Promise<string> {
  try {
    // Download file from Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("resumes")
      .download(filePath);

    if (error || !data) {
      throw new Error(`Failed to download file: ${error?.message}`);
    }

    // Convert to base64
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString("base64");
  } catch (error) {
    console.error("Error converting PDF to base64:", error);
    throw error;
  }
}

async function performOCR(imageBase64: string, filename: string = "document.pdf"): Promise<string> {
  try {
    console.log("🔁 Starting OCR with fallback system...");
    const result = await extractTextWithFallback({ base64: imageBase64, filename });
    console.log(`✅ OCR completed. Provider: ${result.used_provider}, Text length: ${result.text.length}`);
    return result.text;
  } catch (error) {
    console.error("OCR error:", error);
    throw error;
  }
}

async function performAIScreening(
  resumeText: string,
  jobData: ScreeningJob
): Promise<any> {
  try {
    console.log("🔁 Starting AI screening with fallback system...");
    
    // Use fallback system (primary ECS or OpenRouter)
    const result = await analyzeResumeWithFallback({
      resume_text: resumeText,
      job_requirements: {
        job_title: jobData.job_title,
        title: jobData.job_title,
        required_skills: jobData.required_skills,
        years_experience: jobData.years_experience,
        experience_level: jobData.years_experience,
        job_description: jobData.job_description || "",
      },
    });

    console.log(`✅ AI screening completed. Provider: ${result.used_provider}, Score: ${result.score}`);
    
    // Return in format expected by processCandidate (with extracted_info for compatibility)
    return {
      match_score: result.score,
      score: result.score,
      strengths: result.skills_found.length > 0 
        ? [`Found ${result.skills_found.length} required skills`]
        : [],
      weaknesses: result.skills_missing.length > 0
        ? [`Missing: ${result.skills_missing.join(", ")}`]
        : [],
      recommendation: result.reasoning || (result.is_good_fit ? "Recommend for interview" : "Review needed"),
      extracted_info: {
        name: result.candidate_name,
        email: result.candidate_email,
        phone: undefined, // Not extracted by current system
        years_experience: result.years_of_experience,
        skills: result.skills_found,
      },
      // Also include flat format for new code
      candidate_name: result.candidate_name,
      candidate_email: result.candidate_email,
      skills_found: result.skills_found,
      skills_missing: result.skills_missing,
      is_good_fit: result.is_good_fit,
      reasoning: result.reasoning,
      used_provider: result.used_provider,
    };
  } catch (error) {
    console.error("AI screening error:", error);
    throw error;
  }
}

async function processCandidate(
  candidate: Candidate,
  jobData: ScreeningJob
): Promise<void> {
  try {
    console.log(`Processing candidate: ${candidate.filename}`);

    // Update status to processing
    await supabaseAdmin
      .from("candidates")
      .update({ status: "processing", ocr_status: "processing" })
      .eq("id", candidate.id);

    // Step 1: Convert PDF to base64
    const fileBase64 = await convertPDFToBase64(candidate.file_path!);

    // Step 2: Perform OCR with fallback
    const ocrText = await performOCR(fileBase64, candidate.filename);
    console.log(`OCR completed for ${candidate.filename}, text length: ${ocrText.length}`);
    
    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error("OCR extracted no text from document");
    }

    // Update OCR status
    await supabaseAdmin
      .from("candidates")
      .update({
        ocr_text: ocrText,
        ocr_status: "completed",
      })
      .eq("id", candidate.id);

    // Step 3: Perform AI screening
    const aiAnalysis = await performAIScreening(ocrText, jobData);
    console.log(`AI screening completed for ${candidate.filename}, score: ${aiAnalysis.match_score}`);

    // Step 4: Store results
    await supabaseAdmin
      .from("candidates")
      .update({
        ai_analysis: aiAnalysis,
        match_score: aiAnalysis.match_score,
        strengths: aiAnalysis.strengths,
        weaknesses: aiAnalysis.weaknesses,
        recommendation: aiAnalysis.recommendation,
        candidate_name: aiAnalysis.extracted_info?.name,
        candidate_email: aiAnalysis.extracted_info?.email,
        candidate_phone: aiAnalysis.extracted_info?.phone,
        years_of_experience: aiAnalysis.extracted_info?.years_experience,
        top_skills: aiAnalysis.extracted_info?.skills,
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", candidate.id);

    // Increment processed count
    await supabaseAdmin.rpc("increment_processed_count", {
      job_id: jobData.id,
    });

    console.log(`✅ Successfully processed: ${candidate.filename}`);
  } catch (error) {
    console.error(`❌ Error processing candidate ${candidate.filename}:`, error);

    // Mark as failed
    await supabaseAdmin
      .from("candidates")
      .update({
        status: "failed",
        ocr_status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", candidate.id);

    // Increment failed count
    await supabaseAdmin.rpc("increment_failed_count", {
      job_id: jobData.id,
    });
  }
}

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

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing job ID" },
        { status: 400 }
      );
    }

    // Get screening job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("screening_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Error fetching screening job:", jobError);
      return NextResponse.json(
        { error: "Screening job not found" },
        { status: 404 }
      );
    }

    // Update job status to processing
    await supabaseAdmin
      .from("screening_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);

    // Get all candidates for this job
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from("candidates")
      .select("*")
      .eq("screening_job_id", jobId)
      .eq("status", "pending");

    if (candidatesError) {
      console.error("Error fetching candidates:", candidatesError);
      return NextResponse.json(
        { error: "Failed to fetch candidates" },
        { status: 500 }
      );
    }

    if (!candidates || candidates.length === 0) {
      console.log("No pending candidates found");
      await supabaseAdmin.rpc("complete_screening_job", { job_id: jobId });
      return NextResponse.json({
        success: true,
        message: "No pending candidates to process",
      });
    }

    console.log(`Starting to process ${candidates.length} candidates`);

    // Process candidates in batches of 3 (to avoid overloading)
    const BATCH_SIZE = 3;
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(candidates.length / BATCH_SIZE)}`);

      // Process batch in parallel
      await Promise.all(
        batch.map((candidate) => processCandidate(candidate, job))
      );
    }

    // Check statuses
    const { data: remainingCandidates } = await supabaseAdmin
      .from("candidates")
      .select("id")
      .eq("screening_job_id", jobId)
      .in("status", ["pending", "processing"]);

    if (!remainingCandidates || remainingCandidates.length === 0) {
      // Get all candidates and count manually
      const { data: allCandidates } = await supabaseAdmin
        .from("candidates")
        .select("status")
        .eq("screening_job_id", jobId);

      const successCount = (allCandidates || []).filter((c: any) => c.status === "completed").length;
      const failedCount = (allCandidates || []).filter((c: any) => c.status === "failed").length;

      // Decide final job status
      let finalStatus: "completed" | "completed_with_errors" | "failed" = "completed";
      if (successCount === 0 && failedCount > 0) finalStatus = "failed";
      else if (failedCount > 0) finalStatus = "completed_with_errors";

      // Update job status directly
      await supabaseAdmin
        .from("screening_jobs")
        .update({ status: finalStatus })
        .eq("id", jobId);

      // Update user usage with successful only
      if (successCount > 0) {
        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("total_resumes_processed")
          .eq("id", job.user_id)
          .single();
        const currentCount = profile?.total_resumes_processed || 0;
        await supabaseAdmin
          .from("user_profiles")
          .update({
            total_resumes_processed: currentCount + successCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.user_id);
      }

      console.log(`✅ Screening job ${jobId} finished with status: ${finalStatus} (success: ${successCount}, failed: ${failedCount})`);
    }

    return NextResponse.json({
      success: true,
      message: "Processing completed",
      processed: candidates.length,
    });
  } catch (error) {
    console.error("Process screening job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

