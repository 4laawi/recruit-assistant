# Cascade Deletion Guide

## ✅ Automatic Deletion System

When a user deletes a screening job, **everything** associated with it is automatically deleted. Here's how it works:

## 🗑️ What Gets Deleted

When you click the delete button (trash icon) on a screening job:

### 1. **Resume Files in Storage** 
- All PDF/DOCX files uploaded for that screening
- Files are removed from Supabase Storage bucket
- Path: `/resumes/{user_id}/{screening_job_id}/*`

### 2. **Candidate Records**
- All candidate records in the database
- Includes OCR text, AI analysis, match scores
- Automatically deleted via CASCADE

### 3. **Screening Job Record**
- The main screening job record
- Job title, requirements, status, etc.

### 4. **User Statistics**
- Total screening count is decremented
- Keeps usage tracking accurate

## 🏗️ How It Works

### Database CASCADE (Already Configured)

The database schema uses `ON DELETE CASCADE` foreign keys:

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  screening_job_id UUID NOT NULL 
    REFERENCES screening_jobs(id) ON DELETE CASCADE,
  -- other fields...
);
```

**What this means:**
- When a `screening_job` is deleted
- All related `candidates` are **automatically** deleted by PostgreSQL
- No orphaned records left behind

### API Endpoint: `/api/delete-screening-job`

**Flow:**
1. Verify user is authenticated
2. Verify user owns the screening job (security)
3. Get all candidate file paths
4. Delete all files from Supabase Storage
5. Delete the screening job record
   - This CASCADE deletes all candidates automatically
6. Update user statistics
7. Return success

### Frontend Delete Button

**Location:** Dashboard → Screening Cards → Trash Icon

**Features:**
- ⚠️ Confirmation dialog before deletion
- 🔒 Security: Only job owners can delete
- 🔄 Real-time: Updates UI immediately after deletion
- 📊 Updates statistics automatically
- ✅ Success/error notifications

## 🎯 Usage

### For Users

1. Go to Dashboard
2. Find the screening job you want to delete
3. Click the red trash icon
4. Confirm deletion in the dialog
5. Everything is deleted automatically!

### For Developers

```typescript
import { deleteScreeningJob } from '@/lib/api'

// Delete a screening job
await deleteScreeningJob(jobId)
// Done! Everything is cleaned up
```

## 🔒 Security Features

### 1. **Authorization Check**
```typescript
// Verify user owns the screening job
if (job.user_id !== user.id) {
  return 403 Unauthorized
}
```

### 2. **RLS Policies**
- Row Level Security ensures users can only delete their own jobs
- Even if someone bypasses the API, RLS will block it

### 3. **Confirmation Dialog**
- Prevents accidental deletions
- Shows exactly what will be deleted
- "This action cannot be undone" warning

## 📊 What Happens to Statistics

### Updated:
- `total_screenings_count` - Decremented by 1
- `updated_at` - Set to current timestamp

### NOT Updated:
- `total_resumes_processed` - Keeps historical count
- `monthly_usage_count` - Keeps within billing cycle

**Why?** 
- Total resumes processed is a lifetime metric
- Monthly usage is for billing/limits

## 🧪 Testing Cascade Deletion

### Test 1: Delete a screening job
```bash
# Expected result:
✅ Screening job deleted
✅ All candidates deleted
✅ All resume files deleted
✅ UI updated
✅ Statistics updated
```

### Test 2: Check database
```sql
-- After deletion, these should return 0 rows:
SELECT * FROM screening_jobs WHERE id = 'deleted_job_id';
SELECT * FROM candidates WHERE screening_job_id = 'deleted_job_id';
```

### Test 3: Check storage
```bash
# In Supabase Dashboard → Storage → resumes
# The folder for that screening job should be gone
/user_id/deleted_job_id/ ← Should not exist
```

## 🚨 Important Notes

### ⚠️ No Undo!
Once deleted, the data is **permanently gone**. Make sure users understand this.

### 💾 Consider Soft Deletes for Production
For production, you might want to:
1. Add a `deleted_at` timestamp instead of actually deleting
2. Filter out "deleted" jobs in queries
3. Run cleanup jobs later to permanently delete old data

**Soft Delete Example:**
```sql
-- Add this column
ALTER TABLE screening_jobs ADD COLUMN deleted_at TIMESTAMPTZ;

-- Instead of DELETE, do:
UPDATE screening_jobs 
SET deleted_at = NOW() 
WHERE id = 'job_id';

-- Update queries to exclude deleted:
SELECT * FROM screening_jobs 
WHERE user_id = 'user_id' 
AND deleted_at IS NULL;
```

### 📈 Backup Considerations

For production, consider:
1. **Daily Backups** - Supabase provides automatic backups
2. **Export Before Delete** - Offer users a "Download Results" button
3. **Audit Log** - Track who deleted what and when
4. **Trash/Recycle Bin** - 30-day soft delete before permanent deletion

## 🔧 Troubleshooting

### "Failed to delete screening job"

**Possible causes:**
1. **Not authenticated** - User needs to log in
2. **Not authorized** - User doesn't own this job
3. **Network error** - Check connection
4. **Database error** - Check Supabase logs

**Check:**
- Browser console for errors
- Network tab for API response
- Supabase logs in Dashboard

### Files not deleted from Storage

**Possible causes:**
1. **Storage permissions** - Check RLS policies
2. **File path mismatch** - Check `file_path` in candidates table
3. **API timeout** - Too many files to delete at once

**Solution:**
- Check the API logs
- Manually verify in Supabase Storage
- Files in `/resumes/user_id/job_id/` should be gone

### Candidates not deleted

**This should never happen** due to CASCADE, but if it does:

**Check:**
```sql
-- Verify the CASCADE constraint exists
SELECT * FROM information_schema.referential_constraints 
WHERE constraint_name LIKE '%candidates%';

-- Should show: DELETE_RULE = CASCADE
```

## 📝 Future Enhancements

### 1. Bulk Delete
Allow users to select multiple screening jobs and delete them at once.

### 2. Archive Instead of Delete
Move old screenings to an archive rather than deleting.

### 3. Export Before Delete
Automatically generate a CSV/PDF report before deletion.

### 4. Scheduled Deletion
Automatically delete screenings older than X days/months.

### 5. Recycle Bin
30-day grace period before permanent deletion.

## ✅ Summary

✅ **Automatic** - One click deletes everything
✅ **Secure** - Only job owners can delete
✅ **Safe** - Confirmation dialog prevents accidents
✅ **Complete** - Files + Database + Statistics
✅ **Fast** - Happens in seconds
✅ **Reliable** - Database CASCADE ensures consistency

**No orphaned data, no manual cleanup needed!** 🎉


