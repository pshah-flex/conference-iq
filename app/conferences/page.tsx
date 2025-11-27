'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conference, PaginatedResponse } from '@/types';
import ConferenceFilters, { FilterState } from '@/app/components/ConferenceFilters';
import ConferenceCard from '@/app/components/ConferenceCard';
import Pagination from '@/app/components/Pagination';
import { ArrowUpDown } from 'lucide-react';

// Force dynamic rendering to avoid build-time Supabase initialization
export const dynamic = 'force-dynamic';

type SortOption = 'date' | 'name' | 'completeness';

export default function ConferencesPage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    industry: [],
    city: '',
    country: '',
    startDateFrom: '',
    startDateTo: '',
  });
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const pageSize = 20;

  const fetchConferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      // Add filters
      if (filters.searchQuery) {
        params.append('q', filters.searchQuery);
      }
      if (filters.industry.length > 0) {
        params.append('industry', filters.industry.join(','));
      }
      if (filters.city) {
        params.append('city', filters.city);
      }
      if (filters.country) {
        params.append('country', filters.country);
      }
      if (filters.startDateFrom) {
        params.append('startDateFrom', filters.startDateFrom);
      }
      if (filters.startDateTo) {
        params.append('startDateTo', filters.startDateTo);
      }

      const response = await fetch(`/api/conferences?${params.toString()}`);
      const data: PaginatedResponse<Conference> = await response.json();

      if (response.ok) {
        // Sort the data client-side (API doesn't support sorting yet)
        const sortedData = [...data.data].sort((a, b) => {
          switch (sortBy) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'completeness':
              const aCompleteness = a.total_fields_count > 0
                ? a.fields_populated_count / a.total_fields_count
                : 0;
              const bCompleteness = b.total_fields_count > 0
                ? b.fields_populated_count / b.total_fields_count
                : 0;
              return bCompleteness - aCompleteness;
            case 'date':
            default:
              const aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
              const bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
              return bDate - aDate;
          }
        });

        setConferences(sortedData);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        setError('Failed to load conferences');
      }
    } catch (err) {
      setError('An error occurred while loading conferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, sortBy]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conference Directory</h1>
          <p className="text-gray-600">
            Discover and explore conferences from around the world
          </p>
        </div>

        <ConferenceFilters onFiltersChange={setFilters} />

        {/* Sort and Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing {conferences.length} of {total} conferences
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="completeness">Sort by Completeness</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Conference Grid */}
        {!loading && !error && (
          <>
            {conferences.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No conferences found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conferences.map((conference) => (
                    <ConferenceCard key={conference.id} conference={conference} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
    </div>
  );
}

