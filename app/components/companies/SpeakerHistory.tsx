'use client';

import { User, Users } from 'lucide-react';
import Link from 'next/link';

interface SpeakerHistoryItem {
  conference_id: string;
  conference_name: string;
  speaker_count: number;
}

interface SpeakerHistoryProps {
  speakerHistory: SpeakerHistoryItem[];
}

export default function SpeakerHistory({ speakerHistory }: SpeakerHistoryProps) {
  if (speakerHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Speaker History</h2>
        <p className="text-gray-500">No speaker history available.</p>
      </div>
    );
  }

  const totalSpeakers = speakerHistory.reduce(
    (sum, item) => sum + item.speaker_count,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Speaker History ({speakerHistory.length} {speakerHistory.length === 1 ? 'conference' : 'conferences'})
      </h2>

      <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-indigo-600 mr-2" />
          <div>
            <div className="text-sm font-medium text-indigo-900">Total Speakers</div>
            <div className="text-lg font-bold text-indigo-700">{totalSpeakers}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {speakerHistory.map((item) => (
          <div
            key={item.conference_id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center flex-1">
              <User className="w-4 h-4 text-gray-400 mr-3" />
              <Link
                href={`/conferences/${item.conference_id}`}
                className="text-gray-900 hover:text-indigo-600 font-medium"
              >
                {item.conference_name}
              </Link>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {item.speaker_count} {item.speaker_count === 1 ? 'speaker' : 'speakers'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

