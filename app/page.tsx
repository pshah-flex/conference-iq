'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to conferences
    if (!loading && user) {
      router.replace('/conferences');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Conference IQ
        </h1>
        <p className="text-center text-lg mb-8 text-gray-600">
          Discover conferences, speakers, and companies in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 font-medium"
          >
            Sign Up
          </Link>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/conferences"
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Browse conferences without signing in →
          </Link>
        </div>
      </div>
    </div>
  );
}
