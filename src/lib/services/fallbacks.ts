import { NextResponse } from "next/server";

// Dynamic imports for server-side only modules
let pdfjsLib: any;
let createCanvas: any;

async function loadPDFModules() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  if (!createCanvas) {
    const canvas = await import("canvas");
    createCanvas = canvas.createCanvas;
  }
  return { pdfjsLib, createCanvas };
}

type AnalyzeInput = {
  resume_text: string;
  job_requirements: any;
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

const THIRTY_SECONDS = 30_000;

function withTimeout(signal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("timeout")), ms);
  const combined = controller.signal;
  return { signal: combined, cancel: () => clearTimeout(timeout) };
}

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
    // Normalize response format - handle both old format (extracted_info) and new format (flat)
    const normalized = normalizeAnalysisResponse(data);
    return { ...normalized, processing_time_ms: duration, used_provider: "primary" } as AnalyzeOutput;
  } catch (e) {
    console.warn("Primary AI unavailable, switching to OpenRouter fallback:", e);
  }

  // FALLBACK: OpenRouter
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Both services unavailable. Please try again later.");

  const siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
  const title = process.env.OPENROUTER_TITLE || "Resume Analyzer";
  const preferred = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1:free";
  const modelCandidates = [
    preferred,
    "meta-llama/llama-3.1-8b-instruct:free",
  ].filter(Boolean);

  const prompt = buildOpenRouterPrompt(input.resume_text, input.job_requirements);

  let lastErrorText = "";
  for (const model of modelCandidates) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), THIRTY_SECONDS);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": siteUrl,
          "X-Title": title,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
      clearTimeout(t);

      if (!res.ok) {
        lastErrorText = await res.text().catch(() => "");
        // If rate-limited or provider error, try next model
        if (res.status === 429 || lastErrorText.includes("rate-limited") || lastErrorText.includes("Provider returned error")) {
          console.warn(`Model ${model} failed with 429/provider error, trying next model...`);
          continue;
        }
        throw new Error(lastErrorText || `OpenRouter error: ${res.status}`);
      }

      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content || "";
      const mapped = mapOpenRouterToAnalysis(content);
      return { ...mapped, used_provider: "fallback" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`OpenRouter call failed for model ${model}:`, msg);
      lastErrorText = msg;
      // Try next model
      continue;
    }
  }

  throw new Error(lastErrorText || "Both services unavailable. Please try again later.");
}

function buildOpenRouterPrompt(resumeText: string, jobRequirements: any): string {
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

function safeJsonParse<T>(str: string): T | null {
  try { return JSON.parse(str) as T; } catch { return null; }
}

function normalizeAnalysisResponse(data: any): AnalyzeOutput {
  // Handle old format with extracted_info
  if (data.extracted_info) {
    return {
      candidate_name: data.extracted_info.name || data.candidate_name,
      candidate_email: data.extracted_info.email || data.candidate_email,
      score: data.match_score || data.score || 0,
      skills_found: data.skills_found || data.extracted_info?.skills || [],
      skills_missing: data.skills_missing || [],
      years_of_experience: data.extracted_info?.years_experience || data.years_of_experience || 0,
      is_good_fit: data.is_good_fit ?? (data.match_score >= 70),
      reasoning: data.reasoning || data.recommendation || "",
    };
  }
  
  // Handle new flat format
  return {
    candidate_name: data.candidate_name,
    candidate_email: data.candidate_email,
    score: data.score || data.match_score || 0,
    skills_found: Array.isArray(data.skills_found) ? data.skills_found : [],
    skills_missing: Array.isArray(data.skills_missing) ? data.skills_missing : [],
    years_of_experience: data.years_of_experience || 0,
    is_good_fit: data.is_good_fit ?? (data.score >= 70 || data.match_score >= 70),
    reasoning: data.reasoning || "",
  };
}

function mapOpenRouterToAnalysis(content: string): AnalyzeOutput {
  // Try direct JSON
  const direct = safeJsonParse<AnalyzeOutput>(content);
  if (direct && typeof direct.score === "number") {
    return normalizeAnalysisResponse(direct);
  }

  // If the model wrapped JSON in code fences or added text, extract JSON substring
  const match = content.match(/\{[\s\S]*\}/);
  const guessed = match ? safeJsonParse<AnalyzeOutput>(match[0]) : null;
  if (guessed && typeof guessed.score === "number") {
    return normalizeAnalysisResponse(guessed);
  }

  // Fallback minimal structure
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

async function convertPDFToImage(pdfBase64: string): Promise<string> {
  try {
    // Load modules dynamically (server-side only)
    const { pdfjsLib: pdfjs, createCanvas: canvasFn } = await loadPDFModules();
    
    // Set up PDF.js worker (disable for server-side)
    pdfjs.GlobalWorkerOptions.workerSrc = '';
    
    // Load PDF from base64
    const pdfData = Buffer.from(pdfBase64, 'base64');
    const loadingTask = pdfjs.getDocument({ 
      data: pdfData,
      useWorkerFetch: false,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;
    
    // Get first page (most resumes are 1-2 pages)
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
    
    // Create canvas
    const canvas = canvasFn(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context as any,
      viewport: viewport,
    }).promise;
    
    // Convert canvas to PNG base64
    const imageBuffer = canvas.toBuffer('image/png');
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error("PDF to image conversion error:", error);
    throw new Error(`Failed to convert PDF to image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractTextWithFallback(file: { base64: string; filename?: string }): Promise<{ text: string; used_provider: "primary" | "fallback" }> {
  // Try PRIMARY Huawei OCR via internal API (to reuse signing logic)
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), THIRTY_SECONDS);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/ocr`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: file.base64 }),
        signal: controller.signal,
      }
    );
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      const text = data?.markdown_result || data?.raw_result?.result?.text || "";
      if (text && text.trim().length > 0) {
        return { text, used_provider: "primary" };
      }
    }
  } catch (e) {
    console.warn("Primary OCR unavailable, switching to OpenRouter vision model:", e);
  }

  // FALLBACK: OpenRouter Vision Model (qwen/qwen2.5-vl-32b-instruct:free)
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Both services unavailable. Please try again later.");

  const siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
  const title = process.env.OPENROUTER_TITLE || "Resume Analyzer";
  const visionModel = process.env.OPENROUTER_VISION_MODEL || "qwen/qwen2.5-vl-32b-instruct:free";

  // Check if file is PDF or image based on filename
  const isPDF = file.filename?.toLowerCase().endsWith('.pdf') || false;
  
  let imageBase64 = file.base64;
  
  // Convert PDF to image if needed
  if (isPDF) {
    console.log("📄 Converting PDF to image for vision model...");
    try {
      imageBase64 = await convertPDFToImage(file.base64);
      console.log("✅ PDF converted to image successfully");
    } catch (error) {
      console.error("❌ PDF to image conversion failed:", error);
      throw new Error(`Failed to convert PDF to image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Now use the image (either original or converted from PDF)
  const dataUrl = `data:image/png;base64,${imageBase64}`;
  const prompt = `Extract ALL text from this ${isPDF ? 'resume document' : 'image'}. Return ONLY the extracted text, preserving the structure and formatting. Do not add any commentary, analysis, or explanations - just the raw text content.`;
  
  console.log(`📄 Using OpenRouter vision model (${visionModel}) for ${isPDF ? 'PDF (converted to image)' : 'image'} extraction`);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), THIRTY_SECONDS);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": siteUrl,
      "X-Title": title,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: visionModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.1, // Low temperature for accurate extraction
    }),
    signal: controller.signal,
  });
  clearTimeout(t);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Both services unavailable. Please try again later.");
  }

  const json = await res.json();
  
  // Log full response for debugging
  console.log("OpenRouter vision response:", JSON.stringify(json, null, 2));
  
  // Try different response structures
  const extractedText: string = 
    json?.choices?.[0]?.message?.content || 
    json?.choices?.[0]?.message?.text ||
    json?.text ||
    "";
  
  if (!extractedText || extractedText.trim().length === 0) {
    console.error("OpenRouter vision model response structure:", json);
    throw new Error(`OpenRouter vision model returned empty text. Response: ${JSON.stringify(json).substring(0, 500)}`);
  }

  return { text: extractedText.trim(), used_provider: "fallback" };
}


