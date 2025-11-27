# Email Verification Troubleshooting Guide

## Issue: Not Receiving Verification Emails in Production

If users are not receiving verification emails when signing up, follow these steps:

## Step 1: Check Supabase Auth Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **conference-iq**
3. Navigate to **Authentication** → **Providers**
4. Ensure **Email** is enabled
5. Check **"Confirm email"** is enabled (this is required for email verification)

## Step 2: Configure Redirect URLs

The redirect URL in your signup code must be whitelisted in Supabase:

1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to **Redirect URLs**:
   - Your production URL (e.g., `https://conference-iq.vercel.app`)
   - Add: `https://conference-iq.vercel.app/auth/verify-email`
   - Also add: `https://conference-iq.vercel.app/auth/reset-password` (for password reset)

## Step 3: Check Default SMTP Limitations

**Important:** Supabase's default email service has severe limitations:
- **Only 4 emails per hour** (very low rate limit)
- Best-effort delivery (not guaranteed)
- May be blocked by email providers
- Not suitable for production

### Solution: Configure Custom SMTP

For production, you **must** configure a custom SMTP provider:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure one of these providers:
   - **SendGrid** (recommended for ease of setup)
   - **AWS SES**
   - **Mailgun**
   - **Postmark**
   - **Resend** (if you have an account)

### Example: Using Resend (if you have an account)

1. Get your Resend API key from https://resend.com/api-keys
2. In Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `465` (SSL) or `587` (TLS)
   - **SMTP User**: `resend`
   - **SMTP Password**: Your Resend API key
   - **Sender Email**: Your verified domain email (e.g., `noreply@yourdomain.com`)
   - **Sender Name**: `Conference IQ`

### Example: Using SendGrid

1. Create a SendGrid account at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. In Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**:
   - **SMTP Host**: `smtp.sendgrid.net`
   - **SMTP Port**: `587`
   - **SMTP User**: `apikey`
   - **SMTP Password**: Your SendGrid API key
   - **Sender Email**: Your verified sender email
   - **Sender Name**: `Conference IQ`

## Step 4: Check Auth Logs

1. Go to **Logs** → **Auth Logs** in your Supabase Dashboard
2. Look for errors when users try to sign up
3. Common errors:
   - `Email rate limit exceeded` - You've hit the 4 emails/hour limit
   - `SMTP connection failed` - SMTP configuration issue
   - `Invalid redirect URL` - Redirect URL not whitelisted

## Step 5: Test Email Delivery

### Option 1: Test with Mailtrap (Development)

1. Sign up for a free Mailtrap account: https://mailtrap.io
2. Configure Mailtrap SMTP in Supabase:
   - **SMTP Host**: `smtp.mailtrap.io`
   - **SMTP Port**: `2525`
   - **SMTP User**: Your Mailtrap username
   - **SMTP Password**: Your Mailtrap password
3. Test signup - emails will appear in Mailtrap inbox (not sent to real users)

### Option 2: Check Spam Folder

- Ask users to check their spam/junk folder
- The default Supabase sender (`noreply@mail.app.supabase.io`) often gets flagged as spam

## Step 6: Verify Email Template

1. Go to **Authentication** → **Email Templates**
2. Check the **Confirm signup** template
3. Ensure it includes the verification link with `{{ .ConfirmationURL }}` or `{{ .TokenHash }}`

For PKCE flow (which we're using), the template should include:
```html
<a href="{{ .SiteURL }}/auth/verify-email?token_hash={{ .TokenHash }}&type=signup">
  Confirm your email
</a>
```

## Step 7: Check Production Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Quick Fix: Temporarily Disable Email Confirmation (NOT RECOMMENDED FOR PRODUCTION)

If you need to test immediately:

1. Go to **Authentication** → **Providers** → **Email**
2. **Disable** "Confirm email"
3. ⚠️ **Warning**: This allows users to sign up without email verification. Only use for testing!

## Recommended Production Setup

1. ✅ Configure custom SMTP (SendGrid, AWS SES, or Resend)
2. ✅ Enable email confirmation
3. ✅ Whitelist all redirect URLs
4. ✅ Monitor Auth Logs for errors
5. ✅ Set up email domain authentication (SPF, DKIM) for better deliverability

## Next Steps

1. Check your Supabase Dashboard for the current SMTP configuration
2. If using default SMTP, set up a custom SMTP provider immediately
3. Verify redirect URLs are whitelisted
4. Test signup flow after configuration

## Support Resources

- [Supabase Auth Email Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)

