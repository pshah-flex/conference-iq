'use client';

import { Speaker } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';

interface CompanySpeakerStatsProps {
  speakers: Speaker[];
}

export default function CompanySpeakerStats({ speakers }: CompanySpeakerStatsProps) {
  if (speakers.length === 0) {
    return null;
  }

  // Count speakers per company
  const companyStats = speakers.reduce((acc, speaker) => {
    const company = speaker.company || 'Unknown Company';
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format and sort by count
  const chartData = Object.entries(companyStats)
    .map(([company, count]) => ({ company, speakers: count }))
    .sort((a, b) => b.speakers - a.speakers)
    .slice(0, 10); // Top 10 companies

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Company Speaker Distribution</h2>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="company"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="speakers" fill="#4f46e5" name="Speakers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {Object.entries(companyStats)
          .sort(([, a], [, b]) => b - a)
          .map(([company, count]) => (
            <div
              key={company}
              className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
            >
              <div className="flex items-center">
                <Building2 className="w-4 h-4 text-gray-400 mr-2" />
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

