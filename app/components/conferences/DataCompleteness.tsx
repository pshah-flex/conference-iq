'use client';

import { Conference } from '@/types';
import { format } from 'date-fns';
import { CheckCircle2, Calendar } from 'lucide-react';

interface DataCompletenessProps {
  conference: Conference;
}

export default function DataCompleteness({ conference }: DataCompletenessProps) {
  const completenessPercentage =
    conference.total_fields_count > 0
      ? Math.round((conference.fields_populated_count / conference.total_fields_count) * 100)
      : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  const lastCrawled = formatDate(conference.last_crawled_at);
  const lastVerified = formatDate(conference.last_verified_at);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Completeness</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Fields Populated</span>
            <span className="text-sm font-medium text-gray-900">
              {conference.fields_populated_count} / {conference.total_fields_count}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                completenessPercentage >= 75
                  ? 'bg-green-500'
                  : completenessPercentage >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${completenessPercentage}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {completenessPercentage}% complete
          </div>
        </div>

        {lastCrawled && (
          <div className="flex items-start pt-4 border-t border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Last Crawled</div>
              <div className="text-gray-900">{lastCrawled}</div>
            </div>
          </div>
        )}

        {lastVerified && (
          <div className="flex items-start">
            <CheckCircle2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Last Verified</div>
              <div className="text-gray-900">{lastVerified}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

