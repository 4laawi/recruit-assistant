const fs = require("fs");
const path = require("path");

// Test image - simple white image with black text
const testImageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

console.log("🔍 Testing OCR Services - Standalone Test");
console.log("=".repeat(60));

// Load environment variables
require("dotenv").config({ path: ".env.local" });

// Test 1: Huawei Cloud OCR
async function testHuaweiOCR() {
  console.log("\n📤 Testing HUAWEI CLOUD OCR...");

  const {
    HUAWEI_ACCESS_KEY: AK,
    HUAWEI_SECRET_KEY: SK,
    HUAWEI_PROJECT_ID: PROJECT_ID,
    HUAWEI_ENDPOINT: ENDPOINT,
  } = process.env;

  if (!AK || !SK || !PROJECT_ID) {
    console.log("❌ Missing Huawei credentials");
    return false;
  }

  console.log("✅ Credentials found:");
  console.log(`   Access Key: ${AK}`);
  console.log(`   Secret Key: ${SK.substring(0, 8)}...`);
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Endpoint: ${ENDPOINT}`);

  try {
    // Create OCR request body
    const body = {
      image: testImageBase64,
      detect_direction: true,
      quick_mode: false,
      return_markdown_result: true,
    };

    const bodyStr = JSON.stringify(body);

    // Import crypto for signing
    const crypto = require("crypto");

    // Simple test to see if we can make the request
    const url = `https://${ENDPOINT}/v2/${PROJECT_ID}/ocr/general-text`;
    const headers = {
      "Content-Type": "application/json",
      Host: ENDPOINT,
      "X-Sdk-Date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""),
    };

    // Create basic authorization (this will fail but shows the format)
    const timestamp = headers["X-Sdk-Date"];
    const signature = crypto
      .createHmac("sha256", SK)
      .update("test")
      .digest("hex");
    headers[
      "Authorization"
    ] = `SDK-HMAC-SHA256 Access=${AK}, SignedHeaders=content-type;host;x-sdk-date, Signature=${signature}`;

    console.log("🔄 Making request to:", url);
    console.log("📊 Headers:", JSON.stringify(headers, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: bodyStr,
    });

    console.log(`📊 Response Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Huawei OCR SUCCESS!");
      console.log("📄 Result:", JSON.stringify(result, null, 2));
      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ Huawei OCR FAILED:");
      console.log("Status:", response.status);
      console.log("Error:", errorText);
      return false;
    }
  } catch (error) {
    console.log("❌ Huawei OCR ERROR:");
    console.log(error.message);
    return false;
  }
}

// Test 2: OCR.space
async function testOCRSpace() {
  console.log("\n📤 Testing OCR.SPACE...");

  const apiKey = process.env.OCRSPACE_KEY;
  if (!apiKey) {
    console.log("❌ Missing OCRSPACE_KEY");
    return false;
  }

  console.log("✅ API Key found:", apiKey);

  try {
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(testImageBase64, "base64");

    // Create form data
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("file", new Blob([fileBuffer]), "test.png");
    formData.append("language", "eng");
    formData.append("OCREngine", "1"); // Use faster engine
    formData.append("isOverlayRequired", "false");

    console.log("🔄 Making request to OCR.space...");

    const startTime = Date.now();
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });
    const endTime = Date.now();

    console.log(`⏱️  Request took: ${endTime - startTime}ms`);
    console.log(`📊 Response Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ OCR.space SUCCESS!");
      console.log("📊 Result:", JSON.stringify(result, null, 2));
      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ OCR.space FAILED:");
      console.log("Status:", response.status);
      console.log("Error:", errorText);
      return false;
    }
  } catch (error) {
    console.log("❌ OCR.space ERROR:");
    console.log(error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting OCR service tests...\n");

  const huaweiResult = await testHuaweiOCR();
  const ocrSpaceResult = await testOCRSpace();

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY:");
  console.log("=".repeat(60));
  console.log(`Huawei Cloud OCR: ${huaweiResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`OCR.space:         ${ocrSpaceResult ? "✅ PASS" : "❌ FAIL"}`);

  if (!huaweiResult && !ocrSpaceResult) {
    console.log("\n⚠️  Both services failed - this explains your 503 errors!");
  } else if (!huaweiResult) {
    console.log("\n⚠️  Huawei Cloud failed - will rely on OCR.space only");
  } else if (!ocrSpaceResult) {
    console.log("\n⚠️  OCR.space failed - will rely on Huawei Cloud only");
  } else {
    console.log("\n🎉 Both services working - check your application logic");
  }
}

// Handle missing fetch in Node.js
if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
  global.FormData = require("form-data");
}

runTests().catch(console.error);
