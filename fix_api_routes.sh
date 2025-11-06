#!/bin/bash
# Fix remaining API routes that have the build-time environment variable error

API_ROUTES=(
  "src/app/api/get-screening-jobs/route.ts"
  "src/app/api/get-user-stats/route.ts"
  "src/app/api/get-resume-file/route.ts"
  "src/app/api/ocr/route.ts"
  "src/app/api/screen-resume/route.ts"
)

for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    echo "Fixing $route..."
    # Create backup
    cp "$route" "$route.backup"
    
    # Replace the pattern in the file
    sed -i '' 's/const supabaseAdmin = createClient(/g'
    sed -i '' 's/getSupabaseUrl(),/g'
    sed -i '' 's/getSupabaseServiceRoleKey(),/{/g'
    
    # Add runtime client creation function
    sed -i '' '/export async function/a\
\
    // Create Supabase client at runtime\
    const supabaseAdmin = getSupabaseClient();'
    
    # Insert the runtime function
    sed -i '' '/import { NextRequest, NextResponse } from "next\/server";/a\
\
// Runtime Supabase client creation to prevent build-time errors\
function getSupabaseClient() {\
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\
  \
  if (!supabaseUrl || !serviceRoleKey) {\
    throw new Error('\''Required environment variables are missing. Please check your environment variables.'\'');\
  }\
  \
  return createClient(\
    supabaseUrl,\
    serviceRoleKey,\
    {\
      auth: {\
        autoRefreshToken: false,\
        persistSession: false,\
      },\
    }\
  );\
}'
  fi
done

echo "All API routes fixed!"
