# Vercel Environment Variables Setup

To deploy this application to Vercel, you need to configure the following environment variables in your Vercel project settings.

## Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Found in: Supabase Dashboard → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

3. **SUPABASE_SERVICE_ROLE_KEY** (Optional, for admin operations)
   - Your Supabase service role key (keep this secret!)
   - Found in: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
   - ⚠️ **Warning:** Never expose this key in client-side code!

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Production, Preview, Development (select all)
4. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (if needed)

## After Adding Variables

1. **Redeploy** your application (Vercel will automatically trigger a new deployment)
2. Or manually trigger a redeploy from the Vercel dashboard

## Verification

After deployment, you can verify the connection by:
- Visiting `/api/test-connection` endpoint (if implemented)
- Checking the application logs in Vercel dashboard
- Testing the authentication flow

## Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used in server-side code (API routes)
- Never commit these values to your repository

