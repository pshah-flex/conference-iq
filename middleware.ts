import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, skip Supabase initialization and continue
  if (!supabaseUrl || !supabaseAnonKey) {
    return res;
  }

  // Protect admin routes - only allow admin users
  if (pathname.startsWith('/admin')) {
    try {
      const supabase = createMiddlewareClient({ req, res });
      const { data: { session } } = await supabase.auth.getSession();

      // If no session, redirect to login
      if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      // Check if user is admin
      const role = session.user.user_metadata?.role;
      if (role !== 'admin') {
        // Non-admin user trying to access admin routes - redirect to home with error
        const url = req.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      // Admin user - allow access
      return res;
    } catch (error) {
      // If Supabase initialization fails, redirect to home
      console.error('Middleware Supabase error:', error);
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Protect authenticated routes
  const protectedRoutes = ['/bookmarks', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    try {
      const supabase = createMiddlewareClient({ req, res });
      const { data: { session } } = await supabase.auth.getSession();

      // If no session, redirect to login
      if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      // User is authenticated - allow access
      return res;
    } catch (error) {
      // If Supabase initialization fails, redirect to login
      console.error('Middleware Supabase error:', error);
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // For public routes, just refresh session
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


