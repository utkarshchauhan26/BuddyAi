# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click **"New Project"**
4. Fill in:
   - **Name**: BuddyAI (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait for the project to be created (2-3 minutes)

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxx.supabase.co`)
   - **API Key** (`anon` `public` key - the long string)

## 3. Update Your Environment Variables

1. Open the `.env.local` file in your project
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 4. Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire content of `supabase-schema.sql` file
3. Click **"Run"** to execute all the SQL commands
4. This creates all tables, policies, and triggers needed

## 5. Test the Setup

1. Start your development server: `pnpm dev`
2. Open the app in your browser
3. Try signing up with a test email
4. Check if authentication works properly

## 6. Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `tasks`
   - `user_stats`
   - `pomodoro_sessions`
   - `user_settings`
3. Try creating a task to see if data is being saved

## Features Included

✅ **Authentication**: Email/password signup and login
✅ **User Profiles**: Full name and avatar management
✅ **Data Storage**: Tasks, stats, sessions, and settings in cloud
✅ **Data Migration**: Automatically migrates localStorage data when user first logs in
✅ **Row Level Security**: Users can only access their own data
✅ **Real-time Sync**: Changes are instantly saved to cloud

## Troubleshooting

- **"Invalid API key"**: Double-check your environment variables
- **"Policy violation"**: Make sure RLS policies were created correctly
- **"Table doesn't exist"**: Re-run the SQL schema setup
- **Authentication not working**: Check if email confirmations are disabled in Auth settings

Your BuddyAI app now has full authentication and cloud data storage! 🎉