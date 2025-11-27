# Supabase Project Setup

## Project Information

- **Project Name:** conference-iq
- **Project ID:** lhhwnvknimltwxaqwowb
- **Region:** us-east-1
- **Status:** ACTIVE_HEALTHY
- **Database Host:** db.lhhwnvknimltwxaqwowb.supabase.co
- **PostgreSQL Version:** 17.6.1

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lhhwnvknimltwxaqwowb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaHdudmtuaW1sdHd4YXF3b3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxOTY2MDYsImV4cCI6MjA3OTc3MjYwNn0.u9diIxzOGx5brzYOFxxCQ-5_mEYGr_sRFyrBUOhH3Ro
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaHdudmtuaW1sdHd4YXF3b3diIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE5NjYwNiwiZXhwIjoyMDc5NzcyNjA2fQ.MOoodpWH4SJyjRbpesWXyrnwfXG7CnyVqlVlfxrHjn8

# Environment
NODE_ENV=development
```

## Service Role Key

✅ Service role key has been configured and tested.

## Vercel Environment Variables

When deploying to Vercel, add these same environment variables in:
- Vercel Dashboard > Your Project > Settings > Environment Variables
- Add for Production, Preview, and Development environments

## Next Steps

1. Create `.env.local` file with the credentials above
2. Add the service role key from Supabase dashboard
3. Test the connection by running `npm run dev`
4. Proceed to Phase 1: Database Schema & Migrations

