import { NextResponse } from "next/server";

// ==========================================
// CONSTANTS
// ==========================================
const THIRTY_SECONDS = 30_000;

// ==========================================
// TYPES
// ==========================================
type AnalyzeInput = {
  resume_text: string;
  job_requirements: JobRequirements;
};

type AnalyzeOutput = {
  candidate_name?: string;
  candidate_email?: string;
  score: number;
  skills_found: string[];
  skills_missing: string[];
  years_of_experience: number;
  is_good_fit: boolean;
  reasoning: string;
  processing_time_ms?: number;
  used_provider?: "primary" | "fallback";
};

type JobRequirements = {
  title?: string;
  job_title?: string;
  required_skills?: string[] | string;
  years_experience?: number;
  experience_level?: number;
  job_description?: string;
};

type OCRResponse = {
  markdown_result?: string;
  raw_result?: {
    result?: {
      text?: string;
    };
  };
};

type AnalysisResponseData = {
  extracted_info?: {
    name?: string;
    email?: string;
    skills?: string[];
    years_experience?: number;
  };
  candidate_name?: string;
  candidate_email?: string;
  score?: number;
  match_score?: number;
  skills_found?: string[];
  skills_missing?: string[];
  years_of_experience?: number;
  is_good_fit?: boolean;
  reasoning?: string;
  recommendation?: string;
};

// ==========================================
// OCR.SPACE INTEGRATION
// ==========================================
async function extractTextWithOCRSpace(
  file: { base64: string; filename?: string },
  language: string = 'eng'
): Promise<{ text: string; used_provider: "primary" | "fallback" }> {
  try {
    console.log('🔄 Using OCR.space as fallback...');
    
    const apiKey = process.env.OCRSPACE_KEY;
    if (!apiKey) {
      throw new Error('OCRSPACE_KEY not configured');
    }

    // Convert base64 to buffer for form-data
    const fileBuffer = Buffer.from(file.base64, 'base64');
    const filename = file.filename || 'uploaded_file';
    
    // Create form-data
    const formData = new FormData();
    formData.append('apikey', apiKey);
    formData.append('file', new Blob([fileBuffer]), filename);
    formData.append('language', language);
    formData.append('OCREngine', '1'); // Use faster engine to prevent timeouts
    formData.append('isOverlayRequired', 'false');

    console.log('📡 Sending request to OCR.space API...');
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.space API failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('📊 OCR.space response:', JSON.stringify(result, null, 2));

    // Check for OCR.space errors
    if (result.IsErroredOnProcessing) {
      throw new Error(`OCR.space processing error: ${result.ErrorMessage?.join(', ') || 'Unknown error'}`);
    }

    // Extract parsed text
    const parsedText = result.ParsedResults?.[0]?.ParsedText;
    if (!parsedText || parsedText.trim().length === 0) {
      throw new Error('No text found in OCR response');
    }

    console.log('✅ OCR.space extraction successful');
    return { text: parsedText.trim(), used_provider: "fallback" };

  } catch (error) {
    console.error('❌ OCR.space failed:', error);
    throw new Error(`OCR.space extraction failed: ${error}`);
  }
}

// ==========================================
// MAIN OCR FUNCTION (EXPORTED)
// ==========================================
export async function extractTextWithFallback(
  file: { base64: string; filename?: string },
  language: string = 'eng'
): Promise<{ text: string; used_provider: "primary" | "fallback" }> {

  // Try PRIMARY Huawei OCR via internal API
  try {
    console.log('🎯 Trying PRIMARY Huawei OCR...');
    
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), THIRTY_SECONDS);
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/ocr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: file.base64 }),
      signal: controller.signal,
    });
    clearTimeout(t);
    
    if (res.ok) {
      const data: OCRResponse = await res.json();
      const text = data?.markdown_result || data?.raw_result?.result?.text || "";
      if (text && text.trim().length > 0) {
        console.log("✅ Primary OCR succeeded");
        return { text, used_provider: "primary" };
      }
    } else {
      console.warn(`⚠️ Primary OCR failed with status: ${res.status}`);
    }
  } catch (e) {
    console.warn("⚠️ Primary OCR unavailable:", e);
  }

  // FALLBACK: OCR.space
  try {
    console.log('🔄 Switching to OCR.space fallback...');
    return await extractTextWithOCRSpace(file, language);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ All OCR methods failed:", errorMsg);
    throw new Error(`Both services unavailable: ${errorMsg}`);
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function safeJsonParse<T>(str: string): T | null {
  try { return JSON.parse(str) as T; } catch { return null; }
}

function normalizeAnalysisResponse(data: AnalysisResponseData): AnalyzeOutput {
  const matchScore = data.match_score || 0;
  const score = data.score || 0;
  
  if (data.extracted_info) {
    return {
      candidate_name: data.extracted_info.name || data.candidate_name,
      candidate_email: data.extracted_info.email || data.candidate_email,
      score: matchScore || score,
      skills_found: data.skills_found || data.extracted_info?.skills || [],
      skills_missing: data.skills_missing || [],
      years_of_experience: data.extracted_info?.years_experience || data.years_of_experience || 0,
      is_good_fit: data.is_good_fit ?? (matchScore >= 70),
      reasoning: data.reasoning || data.recommendation || "",
    };
  }
  
  return {
    candidate_name: data.candidate_name,
    candidate_email: data.candidate_email,
    score: score || matchScore,
    skills_found: Array.isArray(data.skills_found) ? data.skills_found : [],
    skills_missing: Array.isArray(data.skills_missing) ? data.skills_missing : [],
    years_of_experience: data.years_of_experience || 0,
    is_good_fit: data.is_good_fit ?? (score >= 70 || matchScore >= 70),
    reasoning: data.reasoning || "",
  };
}

function buildOpenRouterPrompt(resumeText: string, jobRequirements: JobRequirements): string {
  const jobTitle = jobRequirements.title || jobRequirements.job_title || "N/A";
  const requiredSkills = Array.isArray(jobRequirements.required_skills) 
    ? jobRequirements.required_skills.join(", ") 
    : jobRequirements.required_skills || "N/A";
  const yearsExp = jobRequirements.years_experience || jobRequirements.experience_level || "N/A";
  const jobDesc = jobRequirements.job_description || "";

  return `You are a professional resume screening AI. Your task is to analyze a candidate's resume against specific job requirements and provide a detailed, accurate assessment.

CRITICAL INSTRUCTIONS:
1. Extract candidate information FIRST (name, email) from the resume text
2. Calculate a match score (0-100) based on:
   - Skills match (weight: 40%)
   - Experience level match (weight: 30%)
   - Overall fit and quality (weight: 30%)
3. Be OPTIMISTIC but FAIR - give credit where due, but don't inflate scores
4. Score 70+ only for genuinely strong candidates
5. Score 50-69 for decent candidates with some gaps
6. Score below 50 only for poor fits
7. Extract ALL skills found in resume (not just required ones)
8. List ONLY missing required skills
9. Calculate years of experience from resume work history

REQUIRED OUTPUT FORMAT (JSON only, no markdown, no code blocks):
{
  "candidate_name": "Full Name from Resume",
  "candidate_email": "email@example.com",
  "score": 75,
  "skills_found": ["skill1", "skill2", "skill3"],
  "skills_missing": ["skill4", "skill5"],
  "years_of_experience": 5,
  "is_good_fit": true,
  "reasoning": "Detailed 2-3 sentence explanation of why this score was given, highlighting strengths and weaknesses"
}

JOB REQUIREMENTS:
- Job Title: ${jobTitle}
- Required Skills: ${requiredSkills}
- Experience Level: ${yearsExp}
${jobDesc ? `- Job Description: ${jobDesc}` : ""}

RESUME TEXT:
${resumeText}

Return ONLY valid JSON, no other text.`;
}

function mapOpenRouterToAnalysis(content: string): AnalyzeOutput {
  const direct = safeJsonParse<AnalyzeOutput>(content);
  if (direct && typeof direct.score === "number") {
    return normalizeAnalysisResponse(direct);
  }

  const match = content.match(/\{[\s\S]*\}/);
  const guessed = match ? safeJsonParse<AnalyzeOutput>(match[0]) : null;
  if (guessed && typeof guessed.score === "number") {
    return normalizeAnalysisResponse(guessed);
  }

  return {
    candidate_name: undefined,
    candidate_email: undefined,
    score: 0,
    skills_found: [],
    skills_missing: [],
    years_of_experience: 0,
    is_good_fit: false,
    reasoning: content?.slice(0, 1000) || "Failed to parse analysis response",
  };
}

// ==========================================
// ANALYSIS FUNCTION (EXPORTED)
// ==========================================
export async function analyzeResumeWithFallback(
  input: AnalyzeInput
): Promise<AnalyzeOutput> {
  const primaryUrl = process.env.QWEN_API_ENDPOINT || "http://159.138.23.8:8000/analyze";

  // Try PRIMARY (Huawei ECS)
  const primaryStart = Date.now();
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), THIRTY_SECONDS);
    const res = await fetch(primaryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok) throw new Error(`Primary failed ${res.status}`);
    const data = await res.json();
    const duration = Date.now() - primaryStart;
    const normalized = normalizeAnalysisResponse(data);
    return { ...normalized, processing_time_ms: duration, used_provider: "primary" } as AnalyzeOutput;
  } catch (e) {
    console.warn("Primary AI unavailable, switching to OpenRouter fallback:", e);
  }

  // FALLBACK: OpenRouter
  try {
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const preferred = "deepseek/deepseek-r1-0528:free";
    const modelCandidates = [
      preferred,
      "meta-llama/llama-3.3-8b-instruct:free",
      "qwen/qwen3-8b",
    ].filter(Boolean);

    const prompt = buildOpenRouterPrompt(input.resume_text, input.job_requirements);

    let lastErrorText = "";
    for (const model of modelCandidates) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), THIRTY_SECONDS);
        
        const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
            "X-Title": process.env.OPENROUTER_TITLE || "Resume Analyzer",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            stream: false,
            temperature: 0.2,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(t);

        if (!completion.ok) {
          throw new Error(`OpenRouter API failed: ${completion.status}`);
        }

        const result = await completion.json();
        const content: string = result?.choices?.[0]?.message?.content || "";
        const mapped = mapOpenRouterToAnalysis(content);
        return { ...mapped, used_provider: "fallback" };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`OpenRouter call failed for model ${model}:`, msg);
        lastErrorText = msg;
        continue;
      }
    }

    throw new Error(lastErrorText || "All OpenRouter models failed");
  } catch (err) {
    throw new Error(`Both services unavailable: ${err instanceof Error ? err.message : String(err)}`);
  }
}
