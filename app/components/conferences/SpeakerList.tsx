'use client';

import { Speaker } from '@/types';
import { User, Building2, ExternalLink } from 'lucide-react';

interface SpeakerListProps {
  speakers: Speaker[];
}

export default function SpeakerList({ speakers }: SpeakerListProps) {
  if (speakers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Speakers</h2>
        <p className="text-gray-500">No speaker information available.</p>
      </div>
    );
  }

  // Group speakers by company
  const groupedByCompany = speakers.reduce((acc, speaker) => {
    const company = speaker.company || 'Unknown Company';
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(speaker);
    return acc;
  }, {} as Record<string, Speaker[]>);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Speakers ({speakers.length})
      </h2>

      <div className="space-y-6">
        {Object.entries(groupedByCompany)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([company, companySpeakers]) => (
            <div key={company} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              <div className="flex items-center mb-3">
                <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">{company}</h3>
                <span className="ml-2 text-sm text-gray-500">
                  ({companySpeakers.length} {companySpeakers.length === 1 ? 'speaker' : 'speakers'})
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
    </div>
  );
}

