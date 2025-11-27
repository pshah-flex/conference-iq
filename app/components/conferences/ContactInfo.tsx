'use client';

import { Conference } from '@/types';
import { Mail, Phone, User } from 'lucide-react';

interface ContactInfoProps {
  conference: Conference;
}

export default function ContactInfo({ conference }: ContactInfoProps) {
  const hasContactInfo =
    conference.organizer_name ||
    conference.organizer_email ||
    conference.organizer_phone;

  if (!hasContactInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
      
      <div className="space-y-4">
        {conference.organizer_name && (
          <div className="flex items-start">
            <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Organizer</div>
              <div className="text-gray-900">{conference.organizer_name}</div>
            </div>
          </div>
        )}

        {conference.organizer_email && (
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Email</div>
              <a
                href={`mailto:${conference.organizer_email}`}
                className="text-indigo-600 hover:text-indigo-500"
              >
                {conference.organizer_email}
              </a>
            </div>
          </div>
        )}

        {conference.organizer_phone && (
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-500">Phone</div>
              <a
                href={`tel:${conference.organizer_phone}`}
                className="text-indigo-600 hover:text-indigo-500"
              >
                {conference.organizer_phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

