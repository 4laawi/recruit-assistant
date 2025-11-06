// Test the full OCR + AI screening workflow
require("dotenv").config({ path: ".env.local" });

console.log("🔍 Testing Full OCR + AI Screening Workflow");
console.log("=".repeat(60));

// Test OCR.space directly
async function testOCRSpace() {
  console.log("\n📤 Step 1: Testing OCR.space...");

  const apiKey = process.env.OCRSPACE_KEY;
  const testImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

  const fileBuffer = Buffer.from(testImageBase64, "base64");
  const formData = new FormData();
  formData.append("apikey", apiKey);
  formData.append("file", new Blob([fileBuffer]), "test.png");
  formData.append("language", "eng");
  formData.append("OCREngine", "1"); // Fast engine

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log(
    `✅ OCR Result: ${result.OCRExitCode === 1 ? "SUCCESS" : "FAILED"}`
  );
  console.log(`⏱️  Processing time: ${result.ProcessingTimeInMilliseconds}ms`);

  return response.ok;
}

// Test OpenRouter API
async function testOpenRouter() {
  console.log("\n🤖 Step 2: Testing OpenRouter API...");

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log("❌ No OpenRouter API key found");
    return false;
  }

  const testPrompt =
    "Analyze this resume for a Web Developer position. Return JSON with score and skills.";

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Resume Analyzer",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [{ role: "user", content: testPrompt }],
          stream: false,
          temperature: 0.2,
        }),
      }
    );

    console.log(`📊 OpenRouter Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log(
        `✅ OpenRouter SUCCESS! Response length: ${
          result?.choices?.[0]?.message?.content?.length || 0
        } chars`
      );
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ OpenRouter FAILED: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenRouter ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const ocrResult = await testOCRSpace();
  const openrouterResult = await testOpenRouter();

  console.log("\n" + "=".repeat(60));
  console.log("📊 WORKFLOW TEST SUMMARY:");
  console.log("=".repeat(60));
  console.log(`OCR.space:        ${ocrResult ? "✅ WORKING" : "❌ FAILED"}`);
  console.log(
    `OpenRouter AI:    ${openrouterResult ? "✅ WORKING" : "❌ FAILED"}`
  );

  if (ocrResult && openrouterResult) {
    console.log(
      "\n🎉 FULL WORKFLOW READY! Resume screening should now work end-to-end."
    );
  } else {
    console.log("\n⚠️  Some services are down - resume screening may fail.");
  }
}

runTests().catch(console.error);
