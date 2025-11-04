# Real-Time Updates Setup Guide

This guide helps you enable real-time updates for screening jobs in your app.

## Problem

Screening jobs stay in "Queued" status even after completion, and only show "Completed" after page refresh.

## Solution Implemented

We've added **dual real-time update system**:
1. **Supabase Real-time Subscriptions** - For instant updates via WebSocket
2. **Automatic Polling** - Fallback that checks every 5 seconds when jobs are active

## Enable Supabase Real-time (Required)

### Step 1: Enable Real-time in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Database** → **Replication**
4. Find these tables and enable real-time:
   - `screening_jobs`
   - `candidates`

### Step 2: Verify Real-time is Working

Open your browser console and look for these messages:
- `📡 Subscription status: SUBSCRIBED` - Real-time is connected ✅
- `🔄 Real-time update - Screening job changed` - Updates are being received ✅
- `🔄 Polling enabled for X active jobs` - Fallback polling is active ✅

## How It Works Now

### Real-time Updates (Primary Method)
- WebSocket connection to Supabase
- Instant updates when database changes
- Zero latency

### Polling (Fallback Method)
- Automatically activates when you have active jobs
- Checks every 5 seconds
- Stops automatically when all jobs are completed
- Ensures you always see the latest status

## Visual Indicators

### Active Jobs
- **Blue ring** around the card
- **Animated pulse** on status badge
- **Spinning loader** icon on "Processing" status
- **Clock icon** on "Queued" status

### Completed Jobs
- **Green badge** with checkmark
- **Toast notification** appears when completed
- Ring and animations removed

## What You'll See

### When Starting a Screening:
1. Job starts as "Queued" (yellow badge, pulsing)
2. Changes to "Processing" (blue badge, spinning loader)
3. Progress bar updates in real-time
4. When complete: "Completed" (green badge) + Toast notification 🎉

### Console Logs (Debug Info):
```
🔄 Polling enabled for 1 active jobs
⏱️ Polling for updates...
🔄 Real-time update - Screening job changed
📡 Subscription status: SUBSCRIBED
🎉 Screening Completed! Frontend Developer - 5 resumes processed
```

## Troubleshooting

### If Status Still Not Updating:

1. **Check Supabase Real-time is Enabled**
   - Go to Database → Replication
   - Enable for `screening_jobs` table

2. **Check Browser Console**
   - Look for subscription status
   - Check for errors

3. **Force Refresh**
   - Polling should work as fallback
   - Updates every 5 seconds automatically

4. **Clear Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Performance Notes

- **Polling only runs when needed** (active jobs present)
- **Polling stops automatically** when all jobs complete
- **Smart caching** prevents unnecessary API calls
- **Real-time preferred** for zero-latency updates

## Benefits

✅ **Real-time status updates** - No more refresh needed
✅ **Automatic completion notifications** - Toast when screening finishes
✅ **Visual feedback** - Animations show active processing
✅ **Reliable fallback** - Polling ensures updates even if WebSocket fails
✅ **Smart polling** - Only when needed, stops when done
✅ **Better UX** - Users always see accurate status

---

**Note:** The polling fallback means the system will work even if Supabase real-time isn't enabled yet, but enabling real-time provides the best experience with instant updates!



