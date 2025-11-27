'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface ConferenceFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  searchQuery: string;
  industry: string[];
  city: string;
  country: string;
  startDateFrom: string;
  startDateTo: string;
}

const COMMON_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Marketing',
  'Sales',
  'HR',
  'Education',
  'Real Estate',
  'Retail',
  'Manufacturing',
  'Energy',
  'Media',
  'Consulting',
  'Legal',
  'Non-profit',
];

export default function ConferenceFilters({ onFiltersChange }: ConferenceFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    industry: [],
    city: '',
    country: '',
    startDateFrom: '',
    startDateTo: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleIndustry = (industry: string) => {
    setFilters((prev) => ({
      ...prev,
      industry: prev.industry.includes(industry)
        ? prev.industry.filter((i) => i !== industry)
        : [...prev.industry, industry],
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      industry: [],
      city: '',
      country: '',
      startDateFrom: '',
      startDateTo: '',
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.industry.length > 0 ||
    filters.city ||
    filters.country ||
    filters.startDateFrom ||
    filters.startDateTo;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search conferences..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Industry Multi-select */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industry
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_INDUSTRIES.map((industry) => (
            <button
              key={industry}
              onClick={() => toggleIndustry(industry)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.industry.includes(industry)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Advanced Filters */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-4"
      >
        {isExpanded ? 'Hide' : 'Show'} advanced filters
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Location Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                id="city"
                type="text"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                placeholder="Filter by city..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={filters.country}
                onChange={(e) => updateFilter('country', e.target.value)}
                placeholder="Filter by country..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDateFrom"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date From
              </label>
              <input
                id="startDateFrom"
                type="date"
                value={filters.startDateFrom}
                onChange={(e) => updateFilter('startDateFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="startDateTo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date To
              </label>
              <input
                id="startDateTo"
                type="date"
                value={filters.startDateTo}
                onChange={(e) => updateFilter('startDateTo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

