'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface CompanySearchResult {
  company_name: string;
  exhibitor_count: number;
  speaker_count: number;
}

export default function CompanySearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data || []);
      } else {
        setError(data.error || 'Failed to search companies');
        setResults([]);
      }
    } catch (err: any) {
      setError('An error occurred while searching');
      setResults([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleCompanyClick = (companyName: string) => {
    const encodedName = encodeURIComponent(companyName);
    router.push(`/companies/${encodedName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Search</h1>
        <p className="text-gray-600">
          Search for companies to view their conference participation history
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for companies..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
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
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No companies found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Found {results.length} {results.length === 1 ? 'company' : 'companies'}
              </div>
              {results.map((company) => (
                <div
                  key={company.company_name}
                  onClick={() => handleCompanyClick(company.company_name)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {company.company_name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-6 ml-7">
                        {company.exhibitor_count > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{company.exhibitor_count}</span>{' '}
                            {company.exhibitor_count === 1 ? 'exhibition' : 'exhibitions'}
                          </div>
                        )}
                        {company.speaker_count > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{company.speaker_count}</span>{' '}
                            {company.speaker_count === 1 ? 'speaker' : 'speakers'}
                          </div>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State - Before Search */}
      {!loading && !hasSearched && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Enter a company name to search</p>
        </div>
      )}
    </div>
  );
}

