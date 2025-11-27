'use client';

import { Speaker } from '@/types';
import { Building2 } from 'lucide-react';

interface SpeakerCompanyStatsProps {
  speakers: Speaker[];
}

export default function SpeakerCompanyStats({ speakers }: SpeakerCompanyStatsProps) {
  if (speakers.length === 0) {
    return null;
  }

  // Count speakers per company
  const companyStats = speakers.reduce((acc, speaker) => {
    const company = speaker.company || 'Unknown Company';
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by count (descending)
  const sortedCompanies = Object.entries(companyStats).sort(([, a], [, b]) => b - a);

  if (sortedCompanies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Speaker Company Statistics</h2>
      
      <div className="space-y-3">
        {sortedCompanies.map(([company, count]) => (
          <div
            key={company}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
          >
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-900">{company}</span>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {count} {count === 1 ? 'speaker' : 'speakers'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

