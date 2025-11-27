'use client';

import { Exhibitor } from '@/types';
import { DollarSign } from 'lucide-react';

interface PricingInfoProps {
  exhibitors: Exhibitor[];
}

export default function PricingInfo({ exhibitors }: PricingInfoProps) {
  // Filter exhibitors with explicit costs
  const exhibitorsWithCosts = exhibitors.filter(
    (exhibitor) => exhibitor.estimated_cost !== null && exhibitor.estimated_cost !== undefined
  );

  if (exhibitorsWithCosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing Information</h2>
        <p className="text-gray-500">
          No explicit pricing information available. Costs are only shown when explicitly stated.
        </p>
      </div>
    );
  }

  // Calculate total
  const total = exhibitorsWithCosts.reduce(
    (sum, exhibitor) => sum + (exhibitor.estimated_cost || 0),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pricing Information</h2>
      
      <div className="space-y-4 mb-6">
        {exhibitorsWithCosts.map((exhibitor) => (
          <div
            key={exhibitor.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
          >
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-gray-900 font-medium">{exhibitor.company_name}</div>
                {exhibitor.exhibitor_tier_normalized && (
                  <div className="text-sm text-gray-500 capitalize">
                    {exhibitor.exhibitor_tier_normalized} tier
                  </div>
                )}
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              ${exhibitor.estimated_cost?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Total (Explicit Costs Only)</span>
          <span className="text-2xl font-bold text-indigo-600">
            ${total.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only explicit costs are shown. Estimates and inferred costs are not included.
        </p>
      </div>
    </div>
  );
}

