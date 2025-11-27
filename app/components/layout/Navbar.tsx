'use client';

import Link from 'next/link';
// TEMPORARY: Auth disabled until Phase 12
// import { useAuth } from '@/app/contexts/AuthContext';
// import { useRouter } from 'next/navigation';

export default function Navbar() {
  // TEMPORARY: Auth disabled until Phase 12
  // const { user, loading, signOut } = useAuth();
  // const router = useRouter();
  // const handleSignOut = async () => {
  //   await signOut();
  //   router.push('/');
  // };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Conference IQ
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/conferences"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Conferences
              </Link>
              {/* TEMPORARY: Bookmarks link hidden until Phase 12 */}
              {/* {user && (
                <Link
                  href="/bookmarks"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bookmarks
                </Link>
              )} */}
            </div>
          </div>
          {/* TEMPORARY: Hide auth links until Phase 12 */}
          {/* <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-gray-500 text-sm">Loading...</span>
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div> */}
        </div>
      </div>
    </nav>
  );
}

