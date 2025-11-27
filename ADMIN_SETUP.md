# Admin Access Setup

## Overview

The Admin Interface is **ONLY accessible to internal admin staff**. All admin routes (`/admin/*`) and admin API endpoints (`/api/admin/*`) are protected and require admin role verification.

## Security Features

1. **Middleware Protection**: All `/admin/*` routes are protected at the middleware level
2. **Layout Protection**: Admin layout component verifies admin access
3. **API Protection**: All admin API routes use `requireAdmin()` from `lib/utils/auth.ts`
4. **Role-Based Access**: Admin role is stored in Supabase user metadata

## Setting Up Admin Users

To grant a user admin access in Supabase:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Find the user you want to make an admin
4. Click on the user to open their details
5. Scroll to **User Metadata** section
6. Click **Add Row** or edit existing metadata
7. Add:
   - **Key**: `role`
   - **Value**: `admin`
8. Click **Save**

### Option 2: Via SQL (Alternative)

```sql
-- Update user metadata to grant admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

### Option 3: Via Supabase Management API

You can also use the Supabase Management API to update user metadata programmatically.

## Verifying Admin Access

After setting the admin role:

1. The user must log out and log back in (or refresh their session)
2. They should be able to access `/admin/conferences` and `/admin/crawl`
3. Non-admin users will be redirected to the home page if they try to access admin routes

## Admin Routes

- `/admin/conferences` - Conference management
- `/admin/crawl` - Crawl management
- `/api/admin/crawl` - Crawl trigger API endpoint

## Security Notes

⚠️ **Important:**
- Never expose admin functionality to regular users
- Admin role is checked on both frontend (layout) and backend (API routes)
- Middleware provides an additional layer of protection
- Always verify admin access in API routes using `requireAdmin()`

## Testing Admin Access

1. Create a test user account
2. Set their `user_metadata.role` to `"admin"` in Supabase
3. Log in with that account
4. Navigate to `/admin/conferences` - should work
5. Try accessing with a non-admin account - should redirect to home

