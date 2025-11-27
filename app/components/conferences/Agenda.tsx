'use client';

import { Conference } from '@/types';
import { Calendar, ExternalLink } from 'lucide-react';

interface AgendaProps {
  conference: Conference;
}

export default function Agenda({ conference }: AgendaProps) {
  if (!conference.agenda_url) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agenda</h2>
      <a
        href={conference.agenda_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-indigo-600 hover:text-indigo-500"
      >
        <Calendar className="w-5 h-5 mr-2" />
        <span>View Conference Agenda</span>
        <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
}

