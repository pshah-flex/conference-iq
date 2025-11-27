'use client';

import { useState, useMemo } from 'react';
import { Speaker } from '@/types';
import { User, Building2, ExternalLink, Filter, ArrowUpDown } from 'lucide-react';

interface SpeakerListProps {
  speakers: Speaker[];
}

type SortOption = 'name' | 'company' | 'title';
type FilterState = {
  company: string;
  title: string;
  industry: string;
};

export default function SpeakerList({ speakers }: SpeakerListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('company');
  const [filters, setFilters] = useState<FilterState>({
    company: '',
    title: '',
    industry: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const uniqueCompanies = useMemo(() => {
    const companies = new Set(
      speakers
        .map((s) => s.company)
        .filter((c): c is string => Boolean(c))
    );
    return Array.from(companies).sort();
  }, [speakers]);

  const uniqueTitles = useMemo(() => {
    const titles = new Set(
      speakers
        .map((s) => s.title)
        .filter((t): t is string => Boolean(t))
    );
    return Array.from(titles).sort();
  }, [speakers]);

  const uniqueIndustries = useMemo(() => {
    const industries = new Set(
      speakers
        .map((s) => s.company_industry)
        .filter((i): i is string => Boolean(i))
    );
    return Array.from(industries).sort();
  }, [speakers]);

  // Filter and sort speakers
  const filteredAndSortedSpeakers = useMemo(() => {
    let filtered = speakers.filter((speaker) => {
      if (filters.company && speaker.company !== filters.company) return false;
      if (filters.title && speaker.title !== filters.title) return false;
      if (filters.industry && speaker.company_industry !== filters.industry) return false;
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [speakers, filters, sortBy]);

  // Group filtered speakers by company
  const groupedByCompany = useMemo(() => {
    return filteredAndSortedSpeakers.reduce((acc, speaker) => {
      const company = speaker.company || 'Unknown Company';
      if (!acc[company]) {
        acc[company] = [];
      }
      acc[company].push(speaker);
      return acc;
    }, {} as Record<string, Speaker[]>);
  }, [filteredAndSortedSpeakers]);

  const clearFilters = () => {
    setFilters({ company: '', title: '', industry: '' });
  };

  const hasActiveFilters = filters.company || filters.title || filters.industry;

  if (speakers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Speakers</h2>
        <p className="text-gray-500">No speaker information available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Speakers ({filteredAndSortedSpeakers.length} of {speakers.length})
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="company">Sort by Company</option>
              <option value="name">Sort by Name</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <select
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <select
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Titles</option>
                {uniqueTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Industries</option>
                {uniqueIndustries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {filteredAndSortedSpeakers.length === 0 ? (
        <p className="text-gray-500">No speakers match the selected filters.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCompany)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([company, companySpeakers]) => (
              <div
                key={company}
                className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
              >
                <div className="flex items-center mb-3">
                  <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">{company}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({companySpeakers.length}{' '}
                    {companySpeakers.length === 1 ? 'speaker' : 'speakers'})
                  </span>
                </div>
                <div className="space-y-2 ml-7">
                  {companySpeakers.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="flex items-start justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{speaker.name}</span>
                        </div>
                        {speaker.title && (
                          <div className="text-sm text-gray-600 ml-6">{speaker.title}</div>
                        )}
                      </div>
                      {speaker.source_url && (
                        <a
                          href={speaker.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 ml-4"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
