'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClientSupabaseWithAuth } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProfilesRepository } from '@/lib/repositories';

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const supabase = createClientSupabaseWithAuth();
        
        // Get the hash from URL (Supabase sends it as a hash fragment)
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (!accessToken || type !== 'signup') {
          setError('Invalid verification link');
          setLoading(false);
          return;
        }

        // Set the session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        // Update profile email_verified status
        if (sessionData?.user) {
          const profilesRepo = new ProfilesRepository();
          await profilesRepo.updateEmailVerified(sessionData.user.id, true);
        }

        setSuccess(true);
        setLoading(false);

        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/conferences');
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to verify email');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-gray-600">
              Your email has been successfully verified. Redirecting...
            </p>
          </div>
          <div>
            <Link
              href="/conferences"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Go to conferences →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Verification Failed</h2>
          <p className="mt-2 text-gray-600">
            {error || 'Invalid or expired verification link.'}
          </p>
        </div>
        <div className="space-y-2">
          <Link
            href="/auth/login"
            className="block text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go to sign in
          </Link>
          <Link
            href="/auth/signup"
            className="block text-sm text-gray-600 hover:text-gray-900"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Verifying...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

