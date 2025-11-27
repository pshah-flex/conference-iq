'use client';

import { Conference } from '@/types';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

interface BasicInfoProps {
  conference: Conference;
}

export default function BasicInfo({ conference }: BasicInfoProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return null;
    }
  };

  const startDate = formatDate(conference.start_date);
  const endDate = formatDate(conference.end_date);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
      
      <div className="space-y-4">
        {startDate && (
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Dates</div>
              <div className="text-gray-900">
                {startDate}
                {endDate && endDate !== startDate && ` - ${endDate}`}
              </div>
            </div>
          </div>
        )}

        {(conference.city || conference.country) && (
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Location</div>
              <div className="text-gray-900">
                {[conference.city, conference.country].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        )}

        {conference.attendance_estimate && (
          <div className="flex items-start">
            <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Estimated Attendance</div>
              <div className="text-gray-900">
                ~{conference.attendance_estimate.toLocaleString()} attendees
              </div>
            </div>
          </div>
        )}

        {conference.industry && conference.industry.length > 0 && (
          <div className="flex items-start">
            <Tag className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Industries</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {conference.industry.map((ind, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

