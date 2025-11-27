import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// Get environment variables (lazy check to avoid build-time errors)
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  return key;
};

// Client-side Supabase client
export const createClientSupabase = () => {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
};

// Server-side Supabase client (for Server Components)
// Must be called from a Server Component or API route
export const createServerSupabase = async () => {
  const { cookies } = await import('next/headers');
  return createServerComponentClient({ cookies });
};

// Client-side Supabase client with auth (for Client Components)
export const createClientSupabaseWithAuth = () => {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    throw new Error('createClientSupabaseWithAuth can only be called in browser environment');
  }
  return createClientComponentClient();
};

// Admin client with service role (use with caution, only in server-side code)
export const createAdminSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};


