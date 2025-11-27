'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Navbar from '@/app/components/layout/Navbar';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;

      if (!user) {
        // Not logged in - redirect to login
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      // Check if user is admin
      const role = user.user_metadata?.role;
      if (role !== 'admin') {
        // Not an admin - redirect to home
        router.push('/');
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    checkAdminAccess();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Checking admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <a
              href="/"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <nav className="ml-8 flex space-x-4">
              <a
                href="/admin/conferences"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Conferences
              </a>
              <a
                href="/admin/crawl"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Crawl Management
              </a>
            </nav>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}

