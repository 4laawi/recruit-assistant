# Setup Guide - Resume Screening SaaS

## Prerequisites
- Supabase account with tables set up
- Huawei Cloud OCR credentials
- Qwen API running on ECS

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Huawei Cloud OCR Configuration
HUAWEI_ACCESS_KEY=your-huawei-access-key
HUAWEI_SECRET_KEY=your-huawei-secret-key
HUAWEI_PROJECT_ID=your-huawei-project-id
HUAWEI_ENDPOINT=ocr.ap-southeast-1.myhuaweicloud.com

# Qwen API (Your ECS Endpoint)
QWEN_API_ENDPOINT=http://your-ecs-ip:port/api/screen

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Setup

### 1. Create Storage Bucket

Go to **Supabase Dashboard > Storage** and create a new bucket:
- Name: `resumes`
- Public: `false` (private)
- File size limit: `10MB`
- Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`

### 2. Get Service Role Key

Go to **Settings > API** and copy the `service_role` key (this is different from the anon key).

⚠️ **Important**: Never expose the service role key in client-side code!

### 3. Enable Realtime

Make sure the Realtime feature is enabled in your Supabase project:
- Go to **Database > Replication**
- Enable replication for tables: `screening_jobs` and `candidates`

## How It Works

### 1. User Uploads Resumes
- Files are uploaded to Supabase Storage (`/user_id/screening_job_id/filename.pdf`)
- File metadata is stored, but processing hasn't started yet

### 2. User Fills Job Requirements
- Job title, required skills, experience level, location
- Optional: full job description for better matching

### 3. User Clicks "Start AI Screening"
- Creates a `screening_job` record in Supabase
- Creates `candidate` records for each uploaded resume
- Triggers background processing (fire-and-forget API call)
- Returns immediately to user with estimated completion time

### 4. Background Processing
- API route `/api/process-screening-job` runs in background
- Processes resumes in batches of 3 (parallel)
- For each resume:
  1. Download from Supabase Storage
  2. Convert to base64
  3. Call OCR API (Huawei Cloud)
  4. Call AI Screening API (Qwen on ECS)
  5. Store results in Supabase
  6. Update progress counters

### 5. Real-time Updates
- Dashboard subscribes to Supabase real-time changes
- User sees live progress as resumes are processed
- No page refresh needed!

### 6. View Results
- When complete, user can view ranked candidates
- Sorted by AI match score (highest first)
- Shows strengths, weaknesses, and recommendations

## API Routes Created

### `/api/upload-resume` (POST)
Upload a single resume file to Supabase Storage.

**Body (FormData):**
- `file`: File object
- `screeningJobId`: String (temporary ID for organizing uploads)

**Response:**
```json
{
  "success": true,
  "fileId": "user_id/job_id/filename.pdf",
  "fileName": "resume.pdf",
  "filePath": "user_id/job_id/filename.pdf"
}
```

### `/api/start-screening` (POST)
Start a new screening job.

**Body:**
```json
{
  "jobTitle": "Frontend Developer",
  "requiredSkills": ["React", "TypeScript"],
  "yearsExperience": "senior",
  "workLocation": "remote",
  "location": "San Francisco, CA",
  "jobDescription": "Full job description...",
  "fileIds": ["file_id_1", "file_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid",
  "message": "Screening started successfully!",
  "estimatedTime": "5 minutes"
}
```

### `/api/process-screening-job` (POST)
Background worker that processes all resumes for a job.

**Body:**
```json
{
  "jobId": "uuid"
}
```

This route runs asynchronously and updates the database as it progresses.

### `/api/get-screening-jobs` (GET)
Get all screening jobs for the authenticated user.

**Query params:**
- `limit`: Number of jobs to return (default: 10)
- `status`: Filter by status (optional)

**Response:**
```json
{
  "success": true,
  "jobs": [...]
}
```

### `/api/get-candidates` (GET)
Get all candidates for a specific screening job.

**Query params:**
- `screeningJobId`: UUID of the screening job

**Response:**
```json
{
  "success": true,
  "candidates": [...]
}
```

### `/api/get-user-stats` (GET)
Get user profile and usage statistics.

**Response:**
```json
{
  "success": true,
  "profile": {...},
  "stats": {
    "totalResumes": 247,
    "activeScreenings": 3,
    "avgProcessingTime": "2.3s",
    "monthlyUsage": 5,
    "monthlyLimit": 10
  }
}
```

## Testing Without Qwen API

If your Qwen API isn't ready yet, the system will use mock AI responses. You can test the entire flow:

1. Upload resumes
2. Fill job requirements
3. Start screening
4. See real-time progress
5. View mock results with random match scores

To enable real AI screening, just set the `QWEN_API_ENDPOINT` environment variable.

## Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Authentication Required** - All API routes verify JWT tokens
✅ **File Validation** - Only PDF/DOCX files under 10MB
✅ **Rate Limiting** - Enforced through subscription tiers
✅ **Private Storage** - Resumes stored in private Supabase bucket

## Deployment Checklist

Before deploying to production:

1. [ ] Set all environment variables in Vercel/hosting platform
2. [ ] Verify Supabase RLS policies are active
3. [ ] Test file upload with different formats
4. [ ] Test OCR API with real resumes
5. [ ] Test Qwen API integration
6. [ ] Set up proper error monitoring (Sentry, LogRocket, etc.)
7. [ ] Configure rate limiting/DDoS protection
8. [ ] Set up email notifications for completed screenings
9. [ ] Add analytics (Posthog, Mixpanel, etc.)

## Troubleshooting

### "Missing authorization header"
Make sure you're logged in. The dashboard checks authentication via `useAuth()` hook.

### "Failed to upload resume"
Check:
- File size < 10MB
- File type is PDF or DOCX
- Supabase Storage bucket `resumes` exists and has correct policies

### "OCR failed"
Check:
- Huawei Cloud credentials are correct
- OCR API endpoint is accessible
- File is a valid PDF/image

### "Real-time updates not working"
Check:
- Supabase Realtime is enabled for your tables
- Tables have replication enabled in Database > Replication

## Next Steps

- [ ] Add proper toast notifications (replace alerts)
- [ ] Add email notifications when screening completes
- [ ] Add export to CSV/Excel
- [ ] Add filtering and search in results
- [ ] Add comparison view for multiple candidates
- [ ] Add interview scheduling integration
- [ ] Add team collaboration features

