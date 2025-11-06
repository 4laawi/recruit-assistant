# TODO: Fix Supabase Build Error

## Problem

Build error: "supabaseUrl is required" in delete-screening-job route

## Steps

- [x] Examine Supabase client configuration
- [x] Check environment variable setup
- [x] Review delete-screening-job API route
- [ ] Fix Supabase client initialization
- [ ] Ensure environment variables are properly loaded
- [ ] Test the fix with build process
- [ ] Verify all API routes work correctly

## Error Details

```
Error: supabaseUrl is required.
    at <unknown> (.next/server/chunks/672.js:34:39411)
    at new bS (.next/server/chunks/672.js:34:39662)
    at bT (.next/server/chunks/672.js:34:44599)
    at 17099 (.next/server/app/api/delete-screening-job/route.js:1:806)
```
