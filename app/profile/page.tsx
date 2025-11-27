'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfilesRepository } from '@/lib/repositories';
import type { Profile } from '@/types';
import Link from 'next/link';

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const profilesRepo = new ProfilesRepository();
        const result = await profilesRepo.findByUserId(user.id);
        
        if (result.error) {
          console.error('Error fetching profile:', result.error);
        } else if (result.data) {
          setProfile(result.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and profile information.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900">{user.email}</p>
                {profile?.email_verified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                    Not Verified
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-sm font-mono text-xs text-gray-500 break-all">{user.id}</p>
              </div>
              {profile && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <p className="text-sm text-gray-900">{profile.display_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding</label>
                    <p className="text-sm text-gray-900">
                      {profile.onboarding_completed ? 'Completed' : 'Not completed'}
                    </p>
                  </div>
                  {profile.last_login_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                      <p className="text-sm text-gray-900">
                        {new Date(profile.last_login_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
              <Link
                href="/conferences"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Conferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


