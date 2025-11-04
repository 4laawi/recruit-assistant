# Troubleshooting Guide

## Error: "Cannot read properties of undefined (reading 'monthlyUsage')"

**Status:** ✅ FIXED

### What was the problem?
The `userStats.stats` object was undefined, causing the dashboard to crash when trying to access `userStats.stats.monthlyUsage`.

### What was fixed?
1. Added optional chaining: `userStats?.stats` instead of `userStats.stats`
2. Added fallback default stats object when API call fails
3. Added better error handling in the API helper function
4. Added console logging to debug the issue

### What to check now:

#### 1. Check Browser Console
Open your browser console (F12) and look for:
```
User stats loaded: {...}
```

This will show you what data is being returned from the API.

#### 2. Check if you're logged in
Make sure you're actually logged in to your account:
- You should see your email in the navbar
- If not logged in, go to `/login` first

#### 3. Check Network Tab
In browser DevTools → Network tab:
- Look for the request to `/api/get-user-stats`
- Check the response status code (should be 200)
- If 401 or 403: Authentication issue
- If 500: Server error (check server logs)

#### 4. Verify Supabase Connection
The most common issue is environment variables. Make sure your `.env.local` has:

```bash
# NO QUOTES around values!
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Remove all quotes from values!

#### 5. Test the API endpoint directly

You can test if the API is working by checking the browser console after loading the dashboard. You should see:

```
User stats loaded: {
  success: true,
  profile: {...},
  stats: {
    totalResumes: 0,
    activeScreenings: 0,
    avgProcessingTime: 'N/A',
    monthlyUsage: 0,
    monthlyLimit: 5
  }
}
```

If you see an error instead, that tells you what's wrong.

### Common Causes and Fixes

#### Cause 1: Not Logged In
**Symptoms:** 
- "Missing authorization header" error
- Page redirects to login
- No user email in navbar

**Fix:** 
1. Go to `/login`
2. Sign in with your account
3. Try dashboard again

#### Cause 2: Invalid Supabase Credentials
**Symptoms:**
- "Unauthorized" error in console
- 401 status code in Network tab
- Can't fetch any data

**Fix:**
1. Check your `.env.local` file
2. Verify credentials in Supabase Dashboard → Settings → API
3. Copy the values EXACTLY (no quotes, no extra spaces)
4. Restart dev server: `npm run dev`

#### Cause 3: Service Role Key Missing
**Symptoms:**
- API calls fail with authentication errors
- Can't create/update database records

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (NOT the anon key)
3. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY=...`
4. Restart dev server

#### Cause 4: User Profile Not Created
**Symptoms:**
- Stats show as 0 or N/A
- "Profile not found" in console

**Fix:**
This should auto-create on first login, but if not:
1. Go to Supabase Dashboard → Table Editor → `user_profiles`
2. Check if your user ID exists
3. If not, the trigger might not be set up correctly
4. Run the SQL again from the setup guide:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Still Having Issues?

If none of the above fixes work, check the following:

1. **Server logs:** Look at your terminal where `npm run dev` is running
2. **Supabase logs:** Dashboard → Logs → check for errors
3. **Browser console:** Check for JavaScript errors
4. **Network tab:** Check all failed requests

### Quick Test Checklist

- [ ] Environment variables set correctly (no quotes)
- [ ] Dev server restarted after changing .env.local
- [ ] Logged in to the application
- [ ] Can access Supabase Dashboard
- [ ] Tables created correctly in Supabase
- [ ] RLS policies enabled
- [ ] User profile exists in database
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows 200 responses

If all boxes are checked and it still doesn't work, share the browser console output and we can debug further!


