import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const createClientSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client (for Server Components)
// Must be called from a Server Component or API route
export const createServerSupabase = async () => {
  const { cookies } = await import('next/headers');
  return createServerComponentClient({ cookies });
};

// Client-side Supabase client with auth (for Client Components)
export const createClientSupabaseWithAuth = () => {
  return createClientComponentClient();
};

// Admin client with service role (use with caution, only in server-side code)
export const createAdminSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};


