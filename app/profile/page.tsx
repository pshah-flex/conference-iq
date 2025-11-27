'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

// TEMPORARY: Bypass authentication until Phase 12
export default function ProfilePage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();

  // TEMPORARY: Don't redirect if not authenticated
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/auth/login');
  //   }
  // }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // TEMPORARY: Show message if not authenticated instead of redirecting
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Profile</h2>
            <p className="mt-2 text-gray-600">
              Authentication is currently bypassed. This page will require login in Phase 12.
            </p>
            <div className="mt-4">
              <a
                href="/conferences"
                className="text-indigo-600 hover:text-indigo-500"
              >
                ← Back to Conferences
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium">User ID</label>
            <p className="mt-1 text-sm font-mono text-xs">{user.id}</p>
          </div>
          <div>
            <button
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


