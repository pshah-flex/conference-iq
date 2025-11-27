'use client';

import Link from 'next/link';
import { Conference } from '@/types';
import { format } from 'date-fns';
import { MapPin, Calendar, Users } from 'lucide-react';
import BookmarkButton from './BookmarkButton';

interface ConferenceCardProps {
  conference: Conference;
}

export default function ConferenceCard({ conference }: ConferenceCardProps) {

  const completenessPercentage = conference.total_fields_count > 0
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

  const startDate = formatDate(conference.start_date);
  const endDate = formatDate(conference.end_date);

  return (
    <Link href={`/conferences/${conference.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
            {conference.name}
          </h3>
          <div onClick={(e) => e.preventDefault()}>
            <BookmarkButton
              conferenceId={conference.id}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {startDate && (
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {startDate}
              {endDate && endDate !== startDate && ` - ${endDate}`}
            </div>
          )}
          {(conference.city || conference.country) && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              {[conference.city, conference.country].filter(Boolean).join(', ')}
            </div>
          )}
          {conference.attendance_estimate && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-2" />
              ~{conference.attendance_estimate.toLocaleString()} attendees
            </div>
          )}
        </div>

        {conference.industry && conference.industry.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {conference.industry.slice(0, 3).map((ind, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
              >
                {ind}
              </span>
            ))}
            {conference.industry.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{conference.industry.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  completenessPercentage >= 75
                    ? 'bg-green-500'
                    : completenessPercentage >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {conference.fields_populated_count}/{conference.total_fields_count} fields
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

