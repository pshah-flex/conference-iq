'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

// TEMPORARY: Bypass authentication until Phase 12
// This page redirects directly to conferences
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to conferences page immediately
    router.replace('/conferences');
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Conference IQ
        </h1>
        <p className="text-center text-lg mb-8">
          Redirecting to conferences...
        </p>
      </div>
    </div>
  );
}
