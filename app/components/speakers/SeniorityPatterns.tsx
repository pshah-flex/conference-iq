'use client';

import { Speaker } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Briefcase } from 'lucide-react';

interface SeniorityPatternsProps {
  speakers: Speaker[];
}

type SeniorityCategory = 'C-Suite' | 'VP' | 'Director' | 'Manager' | 'IC' | 'Other';

const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#6b7280'];

function categorizeTitle(title: string | null): SeniorityCategory {
  if (!title) return 'Other';
  
  const lowerTitle = title.toLowerCase();
  
  if (
    lowerTitle.includes('ceo') ||
    lowerTitle.includes('cto') ||
    lowerTitle.includes('cfo') ||
    lowerTitle.includes('coo') ||
    lowerTitle.includes('chief')
  ) {
    return 'C-Suite';
  }
  
  if (lowerTitle.includes('vp') || lowerTitle.includes('vice president')) {
    return 'VP';
  }
  
  if (lowerTitle.includes('director')) {
    return 'Director';
  }
  
  if (
    lowerTitle.includes('manager') ||
    lowerTitle.includes('lead') ||
    lowerTitle.includes('head')
  ) {
    return 'Manager';
  }
  
  if (
    lowerTitle.includes('engineer') ||
    lowerTitle.includes('developer') ||
    lowerTitle.includes('analyst') ||
    lowerTitle.includes('specialist') ||
    lowerTitle.includes('researcher')
  ) {
    return 'IC';
  }
  
  return 'Other';
}

export default function SeniorityPatterns({ speakers }: SeniorityPatternsProps) {
  if (speakers.length === 0) {
    return null;
  }

  // Categorize speakers by seniority
  const seniorityStats = speakers.reduce((acc, speaker) => {
    const category = categorizeTitle(speaker.title);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<SeniorityCategory, number>);

  // Convert to chart data
  const chartData = Object.entries(seniorityStats).map(([name, value]) => ({
    name,
    value,
  }));

  // Identify pattern
  const maxCategory = Object.entries(seniorityStats).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0] as SeniorityCategory;

  const patternDescription: Record<SeniorityCategory, string> = {
    'C-Suite': 'C-Suite heavy - Executive leadership focus',
    'VP': 'VP heavy - Senior leadership focus',
    'Director': 'Director heavy - Mid-senior leadership focus',
    'Manager': 'Manager heavy - Management focus',
    'IC': 'IC heavy - Individual contributor focus',
    'Other': 'Mixed seniority levels',
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Seniority Patterns</h2>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-start">
          <Briefcase className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-indigo-900">Pattern Identified</div>
            <div className="text-sm text-indigo-700 mt-1">
              {patternDescription[maxCategory]}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {Object.entries(seniorityStats)
          .sort(([, a], [, b]) => b - a)
          .map(([category, count]) => (
            <div
              key={category}
              className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
            >
              <span className="text-gray-900">{category}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {count} ({((count / speakers.length) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

