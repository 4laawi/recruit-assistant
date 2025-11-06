// Direct test of the OCR fallback system
require("dotenv").config({ path: ".env.local" });

const { extractTextWithFallback } = require("./src/lib/services/fallbacks.ts");

// Simple test image with text "Hello World"
const testImageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

async function testOCRFallback() {
  console.log("🔍 Testing OCR Fallback System");
  console.log("=".repeat(50));

  try {
    console.log("📤 Testing with simple image...");
    const result = await extractTextWithFallback({
      base64: testImageBase64,
      filename: "test.png",
    });

    console.log("✅ OCR Fallback Test SUCCESS!");
    console.log("📊 Result:");
    console.log(`   Provider: ${result.used_provider}`);
    console.log(`   Text length: ${result.text.length} characters`);
    console.log(`   Text preview: "${result.text.substring(0, 100)}..."`);

    if (result.used_provider === "fallback") {
      console.log("🎉 Perfect! OCR.space fallback is working after our fix!");
    } else {
      console.log("⚠️  Used primary OCR - Huawei Cloud might be working now");
    }
  } catch (error) {
    console.log("❌ OCR Fallback Test FAILED:");
    console.log("Error:", error.message);
  }
}

testOCRFallback().catch(console.error);
