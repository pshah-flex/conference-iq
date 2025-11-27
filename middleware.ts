import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, skip Supabase initialization and continue
  if (!supabaseUrl || !supabaseAnonKey) {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req, res });
    // Refresh session if expired
    await supabase.auth.getSession();
  } catch (error) {
    // If Supabase initialization fails, log error but continue
    // This prevents middleware from breaking the entire app
    console.error('Middleware Supabase error:', error);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


