# Fix "Database error saving new user" 🔧

## The Problem

You're getting this error because Supabase is trying to save user data to a `profiles` table that either:
1. Doesn't exist yet
2. Doesn't have the right columns
3. Has Row Level Security (RLS) blocking the insert
4. Has a trigger that's failing

## The Solution

Follow these steps to fix it:

### Step 1: Go to Supabase Dashboard

1. Open your browser and go to https://supabase.com
2. Sign in to your account
3. Click on your project
4. Click on **"SQL Editor"** in the left sidebar

### Step 2: Run the Setup SQL

1. In the SQL Editor, click **"+ New query"**
2. Copy ALL the contents from the file: `SUPABASE_PROFILES_SETUP.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

The script will:
- ✅ Create the `profiles` table
- ✅ Set up Row Level Security policies
- ✅ Create a trigger to auto-create profiles on signup
- ✅ Grant proper permissions

### Step 3: Verify It Worked

After running the SQL, you should see success messages. Run this query to verify:

```sql
SELECT * FROM public.profiles;
```

You should see an empty table (or profiles if you have existing users).

### Step 4: Test Sign Up Again

1. Go back to your app: http://localhost:3000/login
2. Click "Sign up"
3. Fill in:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Create Account"
5. ✅ Should work now!

## What Was Created

### `profiles` Table Structure:
```
- id (UUID, primary key, references auth.users)
- email (TEXT)
- full_name (TEXT)
- phone (TEXT)
- company (TEXT)
- job_title (TEXT)
- avatar_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Automatic Features:
- When a user signs up → Profile automatically created
- When user updates in Settings → Profile automatically updated
- When user is deleted → Profile automatically deleted (CASCADE)
- `updated_at` automatically updates on every change

## Alternative: If You DON'T Want a Profiles Table

If you prefer to store everything in user metadata (simpler but less queryable), you can disable the trigger:

```sql
-- Run this in Supabase SQL Editor
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

Then your app will work with just user metadata (stored in `auth.users.raw_user_meta_data`).

**Pros of metadata-only:**
- ✅ Simpler setup
- ✅ No extra table needed
- ✅ Works immediately

**Cons of metadata-only:**
- ❌ Can't query/search users by name
- ❌ Harder to build admin dashboards
- ❌ Less scalable for complex queries

## Recommended Approach

**Use the profiles table!** It's more professional and gives you:
- Better query performance
- Easier user management
- Scalability for future features
- Separate concerns (auth vs profile data)

## Troubleshooting

### Error: "relation 'profiles' already exists"
Your table already exists but might be missing columns. Run:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
```

### Error: "permission denied"
You need to grant permissions:
```sql
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
```

### Error: "trigger already exists"
Drop the old trigger first:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

Then re-run the CREATE TRIGGER command.

## After Setup

Once you've run the SQL:

1. ✅ Sign up works
2. ✅ User data saved to profiles table
3. ✅ Name shows in dashboard
4. ✅ Settings page works
5. ✅ All features functional!

---

**Run the SQL script and you're good to go!** 🚀







