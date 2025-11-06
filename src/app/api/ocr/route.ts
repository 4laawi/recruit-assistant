import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// === Load credentials from environment ===
const AK = process.env.HUAWEI_ACCESS_KEY;
const SK = process.env.HUAWEI_SECRET_KEY;
const PROJECT_ID = process.env.HUAWEI_PROJECT_ID;
const ENDPOINT = process.env.HUAWEI_ENDPOINT || "ocr.ap-southeast-1.myhuaweicloud.com";

/**
 * Huawei Cloud Signer - Extracted from official signer.js for Node.js
 * Based on: https://support.huaweicloud.com/intl/en-us/devg-apisign/api-sign-sdk-nodejs.html
 */

const hexTable = new Array(256);
for (let i = 0; i < 256; ++i) {
  hexTable[i] = "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase();
}

const noEscape = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, // 80 - 95
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, // 112 - 127
];

function urlEncode(str: string): string {
  let out = "";
  let lastPos = 0;

  for (let i = 0; i < str.length; ++i) {
    let c = str.charCodeAt(i);

    if (c < 0x80) {
      if (noEscape[c] === 1) continue;
      if (lastPos < i) out += str.slice(lastPos, i);
      lastPos = i + 1;
      out += hexTable[c];
      continue;
    }

    if (lastPos < i) out += str.slice(lastPos, i);

    if (c < 0x800) {
      lastPos = i + 1;
      out += hexTable[0xc0 | (c >> 6)] + hexTable[0x80 | (c & 0x3f)];
      continue;
    }
    if (c < 0xd800 || c >= 0xe000) {
      lastPos = i + 1;
      out +=
        hexTable[0xe0 | (c >> 12)] +
        hexTable[0x80 | ((c >> 6) & 0x3f)] +
        hexTable[0x80 | (c & 0x3f)];
      continue;
    }
    ++i;
    const c2 = str.charCodeAt(i) & 0x3ff;
    lastPos = i + 1;
    c = 0x10000 + (((c & 0x3ff) << 10) | c2);
    out +=
      hexTable[0xf0 | (c >> 18)] +
      hexTable[0x80 | ((c >> 12) & 0x3f)] +
      hexTable[0x80 | ((c >> 6) & 0x3f)] +
      hexTable[0x80 | (c & 0x3f)];
  }
  if (lastPos === 0) return str;
  if (lastPos < str.length) return out + str.slice(lastPos);
  return out;
}

function canonicalURI(uri: string): string {
  const patterns = uri.split("/");
  const encoded = patterns.map((v) => urlEncode(v));
  let urlpath = encoded.join("/");
  if (urlpath[urlpath.length - 1] !== "/") {
    urlpath = urlpath + "/";
  }
  return urlpath;
}

function canonicalHeaders(
  headers: Record<string, string>,
  signedHeaders: string[]
): string {
  const h: Record<string, string> = {};
  for (const key in headers) {
    h[key.toLowerCase()] = headers[key];
  }
  const a = [];
  for (const key of signedHeaders) {
    a.push(key + ":" + h[key].trim());
  }
  return a.join("\n") + "\n";
}

function signedHeaders(headers: Record<string, string>): string[] {
  const a = [];
  for (const key in headers) {
    a.push(key.toLowerCase());
  }
  a.sort();
  return a;
}

function getTime(): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function signRequest(
  method: string,
  host: string,
  uri: string,
  headers: Record<string, string>,
  body: string,
  ak: string,
  sk: string
): Record<string, string> {
  const timestamp = getTime();
  headers["Host"] = host;
  headers["X-Sdk-Date"] = timestamp;

  const signed = signedHeaders(headers);
  const canonicalHeadersStr = canonicalHeaders(headers, signed);
  const hashedBody = crypto.createHash("sha256").update(body).digest("hex");
  const canonicalURIStr = canonicalURI(uri);

  // Build canonical request
  const canonicalRequest =
    method +
    "\n" +
    canonicalURIStr +
    "\n" +
    "\n" + // query string (empty)
    canonicalHeadersStr +
    "\n" +
    signed.join(";") +
    "\n" +
    hashedBody;

  // Hash canonical request
  const hashedCanonicalRequest = crypto
    .createHash("sha256")
    .update(canonicalRequest)
    .digest("hex");

  // String to sign
  const stringToSign = `SDK-HMAC-SHA256\n${timestamp}\n${hashedCanonicalRequest}`;

  // Calculate signature
  const signature = crypto
    .createHmac("sha256", sk)
    .update(stringToSign)
    .digest("hex");

  // Authorization header
  headers["Authorization"] = `SDK-HMAC-SHA256 Access=${ak}, SignedHeaders=${signed.join(
    ";"
  )}, Signature=${signature}`;

  return headers;
}

// === OCR endpoint ===
export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (!AK || !SK || !PROJECT_ID) {
      console.error("❌ Missing Huawei Cloud credentials");
      return NextResponse.json(
        {
          error:
            "Huawei Cloud credentials not configured. Please set HUAWEI_ACCESS_KEY, HUAWEI_SECRET_KEY, and HUAWEI_PROJECT_ID",
        },
        { status: 500 }
      );
    }

    console.log("✅ Credentials loaded successfully");

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64" },
        { status: 400 }
      );
    }

    // === Create OCR request body (matches Python script) ===
    const body = {
      image: imageBase64,
      detect_direction: true, // auto-align tilted resumes
      quick_mode: false, // full multi-line processing
      return_markdown_result: true, // get concatenated text
    };

    const bodyStr = JSON.stringify(body);

    // === Sign request using Huawei Cloud signing algorithm ===
    const uri = `/v2/${PROJECT_ID}/ocr/general-text`;
    const headers = {
      "Content-Type": "application/json",
    };

    // Sign the request (adds Authorization, X-Sdk-Date, and Host headers)
    const signedHeaders = signRequest(
      "POST",
      ENDPOINT,
      uri,
      headers,
      bodyStr,
      AK,
      SK
    );

    console.log("📤 Sending OCR request to Huawei Cloud...");
    console.log("URL:", `https://${ENDPOINT}${uri}`);
    console.log("Headers:", JSON.stringify(signedHeaders, null, 2));
    console.log("Body length:", bodyStr.length);

    // === Send request to PRIMARY (Huawei) ===
    const url = `https://${ENDPOINT}${uri}`;
    const primaryController = new AbortController();
    const primaryTimeout = setTimeout(() => primaryController.abort(), 30000);
    const response = await fetch(url, {
      method: "POST",
      headers: signedHeaders,
      body: bodyStr,
      signal: primaryController.signal,
    });
    clearTimeout(primaryTimeout);

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ OCR successful (primary)");
      const markdown = result?.result?.markdown_result || "";
      return NextResponse.json(
        {
          success: true,
          markdown_result: markdown,
          raw_result: result,
          used_provider: "primary",
        },
        { headers: { 'x-api-used': 'primary' } }
      );
    } else {
      console.warn("⚠️ Huawei OCR failed");
      throw new Error(`Huawei OCR failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("❌ OCR API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OCR service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
