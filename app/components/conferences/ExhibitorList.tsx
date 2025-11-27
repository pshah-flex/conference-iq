'use client';

import { Exhibitor } from '@/types';
import { Building2, ExternalLink } from 'lucide-react';

interface ExhibitorListProps {
  exhibitors: Exhibitor[];
}

export default function ExhibitorList({ exhibitors }: ExhibitorListProps) {
  if (exhibitors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exhibitors</h2>
        <p className="text-gray-500">No exhibitor information available.</p>
      </div>
    );
  }

  // Group by tier if available
  const groupedByTier = exhibitors.reduce((acc, exhibitor) => {
    const tier = exhibitor.exhibitor_tier_normalized || 'Other';
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(exhibitor);
    return acc;
  }, {} as Record<string, Exhibitor[]>);

  const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'standard', 'unknown', 'Other'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Exhibitors ({exhibitors.length})
      </h2>

      {Object.keys(groupedByTier).length > 1 ? (
        // Grouped by tier
        <div className="space-y-6">
          {tierOrder
            .filter((tier) => groupedByTier[tier])
            .map((tier) => (
              <div key={tier}>
                <h3 className="text-lg font-medium text-gray-700 mb-3 capitalize">
                  {tier === 'Other' ? 'Other Exhibitors' : `${tier} Sponsors`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedByTier[tier].map((exhibitor) => (
                    <div
                      key={exhibitor.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{exhibitor.company_name}</span>
                      </div>
                      {exhibitor.source_url && (
                        <a
                          href={exhibitor.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500"
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
      ) : (
        // Simple list
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exhibitors.map((exhibitor) => (
            <div
              key={exhibitor.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{exhibitor.company_name}</span>
                {exhibitor.exhibitor_tier_normalized && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded capitalize">
                    {exhibitor.exhibitor_tier_normalized}
                  </span>
                )}
              </div>
              {exhibitor.source_url && (
                <a
                  href={exhibitor.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

