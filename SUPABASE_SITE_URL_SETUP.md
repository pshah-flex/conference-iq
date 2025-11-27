# Supabase Site URL Configuration

## Issue: Magic Links Redirecting to Localhost

When you send magic links from the Supabase dashboard, they redirect to `localhost:3000` instead of your production URL. This happens because Supabase uses the **Site URL** configured in your project settings.

## Solution: Update Supabase Site URL

### Step 1: Go to Supabase Dashboard

1. Navigate to: https://supabase.com/dashboard/project/lhhwnvknimltwxaqwowb
2. Go to **Project Settings** → **Auth** → **URL Configuration**

### Step 2: Update Site URL

Update the **Site URL** field to your production URL:

**For Vercel deployment:**
- `https://conference-iq.vercel.app` (or your custom domain if configured)

**For local development:**
- Keep `http://localhost:3000` for local testing

### Step 3: Add Redirect URLs

In the same section, add your redirect URLs to the **Redirect URLs** list:

**Production URLs:**
- `https://conference-iq.vercel.app/auth/verify-email`
- `https://conference-iq.vercel.app/auth/reset-password`
- `https://conference-iq.vercel.app/auth/callback` (if using OAuth)

**Development URLs (optional):**
- `http://localhost:3000/auth/verify-email`
- `http://localhost:3000/auth/reset-password`

### Step 4: Update Environment Variable (Optional but Recommended)

Add this to your Vercel environment variables:

**Key:** `NEXT_PUBLIC_SITE_URL`  
**Value:** `https://conference-iq.vercel.app` (or your actual production URL)

This ensures the application knows its production URL even when running in different environments.

## How It Works

1. **Site URL**: This is the default redirect URL used when no `redirectTo` is specified. Magic links sent from the dashboard use this.

2. **Redirect URLs**: These are whitelisted URLs that Supabase allows redirects to. Any redirect URL must be in this list.

3. **Code Changes**: The `verify-email` page has been updated to:
   - Detect if a user lands on localhost with a production magic link
   - Automatically redirect to the production URL with the same hash
   - Handle both PKCE flow (token_hash) and implicit flow (access_token)

## Testing

After updating the Site URL:

1. Send a new magic link from the Supabase dashboard
2. The link should now redirect to your production URL
3. The user will be automatically logged in and redirected to `/conferences`

## Important Notes

- **Site URL** should be your production URL in production
- **Redirect URLs** must include all URLs you want to redirect to
- Magic links are single-use and expire after a set time (default: 1 hour)
- If you change the Site URL, existing magic links will still use the old URL

## Troubleshooting

If magic links still redirect to localhost:

1. ✅ Verify Site URL is set to production URL
2. ✅ Check that redirect URLs are whitelisted
3. ✅ Clear browser cache and try a new magic link
4. ✅ Check Supabase Auth logs for errors
5. ✅ Ensure `NEXT_PUBLIC_SITE_URL` environment variable is set in Vercel

