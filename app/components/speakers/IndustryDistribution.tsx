'use client';

import { Speaker } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Factory } from 'lucide-react';

interface IndustryDistributionProps {
  speakers: Speaker[];
}

export default function IndustryDistribution({ speakers }: IndustryDistributionProps) {
  if (speakers.length === 0) {
    return null;
  }

  // Count speakers by industry
  const industryStats = speakers.reduce((acc, speaker) => {
    const industry = speaker.company_industry || 'Unknown Industry';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format and sort by count
  const chartData = Object.entries(industryStats)
    .map(([industry, count]) => ({ industry, speakers: count }))
    .sort((a, b) => b.speakers - a.speakers);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Industry Distribution</h2>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="industry"
              type="category"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="speakers" fill="#8b5cf6" name="Speakers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {Object.entries(industryStats)
          .sort(([, a], [, b]) => b - a)
          .map(([industry, count]) => (
            <div
              key={industry}
              className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
            >
              <div className="flex items-center">
                <Factory className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-900">{industry}</span>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                {count} {count === 1 ? 'speaker' : 'speakers'}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

