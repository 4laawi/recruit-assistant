# Supabase Storage Setup for Resume Files

Since storage buckets can't be created via SQL, follow these steps in the Supabase Dashboard:

## Step 1: Create the Bucket

1. Go to **Supabase Dashboard** → Your Project
2. Click **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter the following:
   - **Name**: `resumes`
   - **Public**: `OFF` (keep it private)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: 
     ```
     application/pdf
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/msword
     ```

## Step 2: Set Up Storage Policies

After creating the bucket, go to **Storage** → **Policies** → Click on the `resumes` bucket.

Add these three policies:

### Policy 1: Users can upload their own resumes

```sql
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**What it does**: Allows users to upload files to their own folder (`user_id/...`)

### Policy 2: Users can read their own resumes

```sql
CREATE POLICY "Users can read own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**What it does**: Allows users to download/view files from their own folder

### Policy 3: Users can delete their own resumes

```sql
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**What it does**: Allows users to delete files from their own folder

## File Organization Structure

Files will be organized like this:

```
resumes/
├── user_uuid_1/
│   ├── screening_job_uuid_a/
│   │   ├── 1234567890_resume1.pdf
│   │   └── 1234567891_resume2.pdf
│   └── screening_job_uuid_b/
│       └── 1234567892_resume3.pdf
└── user_uuid_2/
    └── screening_job_uuid_c/
        ├── 1234567893_resume4.pdf
        └── 1234567894_resume5.pdf
```

This ensures:
- ✅ Each user has their own folder
- ✅ Each screening job has its own subfolder
- ✅ Files are timestamped to avoid naming conflicts
- ✅ RLS policies prevent cross-user access

## Testing Storage

After setup, test with this code:

```javascript
import { supabase } from '@/lib/supabaseClient'

// Upload a test file
const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
const { data, error } = await supabase.storage
  .from('resumes')
  .upload(`${user.id}/test_job/test.pdf`, testFile)

console.log('Upload result:', data, error)

// Download the file
const { data: downloadData, error: downloadError } = await supabase.storage
  .from('resumes')
  .download(`${user.id}/test_job/test.pdf`)

console.log('Download result:', downloadData, downloadError)
```

If both operations succeed without errors, your storage is configured correctly! 🎉

## Troubleshooting

### "new row violates row-level security policy"
- Make sure policies are created for the `storage.objects` table
- Verify the user is authenticated (`auth.uid()` returns a value)

### "413 Payload Too Large"
- Check the file size limit on the bucket
- Default is 50MB, we set it to 10MB for resumes

### "Invalid MIME type"
- Only PDF and DOCX files are allowed
- Check the `allowed_mime_types` setting on the bucket

## Security Notes

🔒 **Important**: 
- The bucket is PRIVATE - files are not publicly accessible
- Each user can only access their own files
- Service role key is used server-side for admin operations
- Never expose service role key to the client!

## Next Steps

Once storage is set up:
1. ✅ Users can upload resumes via the dashboard
2. ✅ Files are securely stored and organized
3. ✅ Background processing can download and process them
4. ✅ Users can download results later if needed

