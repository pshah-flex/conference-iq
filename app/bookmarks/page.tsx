'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Conference, Bookmark } from '@/types';
import ConferenceCard from '@/app/components/ConferenceCard';
import ConferenceFilters, { FilterState } from '@/app/components/ConferenceFilters';
import Pagination from '@/app/components/Pagination';
import { Bookmark as BookmarkIcon } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function BookmarksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    industry: [],
    city: '',
    country: '',
    startDateFrom: '',
    startDateTo: '',
    searchQuery: '',
  });
  const [sortBy, setSortBy] = useState<'name' | 'start_date' | 'created_at'>('start_date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login if not authenticated
      router.push('/auth/login?redirect=/bookmarks');
      return;
    }

    if (user) {
      fetchBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  useEffect(() => {
    if (bookmarks.length > 0) {
      fetchConferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, filters, sortBy, page]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookmarks');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login?redirect=/bookmarks');
          return;
        }
        throw new Error('Failed to fetch bookmarks');
      }
      const data = await response.json();
      setBookmarks(data || []);
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConferences = async () => {
    if (bookmarks.length === 0) {
      setConferences([]);
      setTotalPages(1);
      return;
    }

    try {
      const bookmarkIds = bookmarks.map((b) => b.conference_id);
      
      // Fetch all bookmarked conferences
      const allConferences: Conference[] = [];
      for (const bookmarkId of bookmarkIds) {
        try {
          const response = await fetch(`/api/conferences/${bookmarkId}`);
          if (response.ok) {
            const conf = await response.json();
            allConferences.push(conf);
          }
        } catch (error) {
          console.error(`Error fetching conference ${bookmarkId}:`, error);
        }
      }

      // Apply filters
      let filtered = allConferences;

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (conf) =>
            conf.name?.toLowerCase().includes(query) ||
            conf.city?.toLowerCase().includes(query) ||
            conf.country?.toLowerCase().includes(query)
        );
      }

      if (filters.industry.length > 0) {
        filtered = filtered.filter(
          (conf) =>
            conf.industry &&
            Array.isArray(conf.industry) &&
            filters.industry.some((ind) => conf.industry?.includes(ind))
        );
      }

      if (filters.city) {
        filtered = filtered.filter((conf) => conf.city === filters.city);
      }

      if (filters.country) {
        filtered = filtered.filter((conf) => conf.country === filters.country);
      }

      if (filters.startDateFrom) {
        filtered = filtered.filter(
          (conf) => conf.start_date && new Date(conf.start_date) >= new Date(filters.startDateFrom)
        );
      }

      if (filters.startDateTo) {
        filtered = filtered.filter(
          (conf) => conf.start_date && new Date(conf.start_date) <= new Date(filters.startDateTo)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          case 'start_date':
            const aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
            const bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
            return aDate - bDate;
          case 'created_at':
            // Sort by bookmark creation date (most recent first)
            const aBookmark = bookmarks.find((b) => b.conference_id === a.id);
            const bBookmark = bookmarks.find((b) => b.conference_id === b.id);
            const aCreated = aBookmark?.created_at ? new Date(aBookmark.created_at).getTime() : 0;
            const bCreated = bBookmark?.created_at ? new Date(bBookmark.created_at).getTime() : 0;
            return bCreated - aCreated; // Most recent first
          default:
            return 0;
        }
      });

      // Apply pagination
      const total = filtered.length;
      const totalPagesCount = Math.ceil(total / pageSize);
      setTotalPages(totalPagesCount);

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);

      setConferences(paginated);
    } catch (error: any) {
      console.error('Error fetching conferences:', error);
      setError(error.message);
    }
  };

  const handleBookmarkRemoved = (conferenceId: string) => {
    // Remove from local state
    setBookmarks(bookmarks.filter((b) => b.conference_id !== conferenceId));
    setConferences(conferences.filter((c) => c.id !== conferenceId));
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BookmarkIcon className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
        </div>
        <p className="text-gray-600">
          {bookmarks.length === 0
            ? "You haven't bookmarked any conferences yet."
            : `You have ${bookmarks.length} bookmarked conference${bookmarks.length === 1 ? '' : 's'}.`}
        </p>
      </div>

      {bookmarks.length > 0 && (
        <>
          {/* Filters */}
          <div className="mb-6">
            <ConferenceFilters onFiltersChange={setFilters} />
          </div>

          {/* Sort */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {conferences.length} of {bookmarks.length} bookmarked conference{bookmarks.length === 1 ? '' : 's'}
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="start_date">Date</option>
                <option value="name">Name</option>
                <option value="created_at">Recently Bookmarked</option>
              </select>
            </div>
          </div>

          {/* Conferences Grid */}
          {conferences.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No conferences match your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {conferences.map((conference) => (
                  <div key={conference.id}>
                    <ConferenceCard conference={conference} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </>
      )}

      {bookmarks.length === 0 && (
        <div className="text-center py-12">
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            Start bookmarking conferences to save them for later!
          </p>
          <a
            href="/conferences"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Browse Conferences →
          </a>
        </div>
      )}
    </div>
  );
}

