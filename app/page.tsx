'use client';

import { useAuth } from './contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Conference IQ
        </h1>
        <p className="text-center text-lg mb-8">
          Conference Intelligence Platform
        </p>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : user ? (
          <div className="text-center space-y-4">
            <p>Welcome, {user.email}!</p>
            <div className="space-x-4">
              <Link
                href="/profile"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Profile
              </Link>
              <Link
                href="/conferences"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Conferences
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center space-x-4">
            <Link
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

