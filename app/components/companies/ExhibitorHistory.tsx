'use client';

import { format } from 'date-fns';
import { Calendar, DollarSign, Award, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ExhibitorHistoryItem {
  conference_id: string;
  conference_name: string;
  tier: string | null;
  cost: number | null;
}

interface ExhibitorHistoryProps {
  exhibitorHistory: ExhibitorHistoryItem[];
  totalSpend: number | null;
}

export default function ExhibitorHistory({
  exhibitorHistory,
  totalSpend,
}: ExhibitorHistoryProps) {
  if (exhibitorHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exhibition History</h2>
        <p className="text-gray-500">No exhibition history available.</p>
      </div>
    );
  }

  // Calculate total from explicit costs
  const explicitCostsTotal = exhibitorHistory
    .filter((item) => item.cost !== null && item.cost !== undefined)
    .reduce((sum, item) => sum + (item.cost || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Exhibition History ({exhibitorHistory.length})
      </h2>

      <div className="space-y-4 mb-6">
        {exhibitorHistory.map((item) => (
          <div
            key={item.conference_id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/conferences/${item.conference_id}`}
                  className="text-lg font-medium text-indigo-600 hover:text-indigo-700 mb-2 block"
                >
                  {item.conference_name}
                </Link>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {item.tier && (
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span className="capitalize">{item.tier}</span>
                    </div>
                  )}
                  {item.cost !== null && item.cost !== undefined && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>${item.cost.toLocaleString()}</span>
                    </div>
                  )}
                  {item.cost === null && (
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Cost unknown</span>
                    </div>
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Total Spend Summary */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Total Spend (Explicit Costs Only)</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              ${explicitCostsTotal.toLocaleString()}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only explicit costs are shown. Conferences without explicit pricing are not included in the total.
        </p>
        {exhibitorHistory.filter((item) => item.cost === null).length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {exhibitorHistory.filter((item) => item.cost === null).length} conference
            {exhibitorHistory.filter((item) => item.cost === null).length !== 1 ? 's' : ''} with
            unknown costs
          </p>
        )}
      </div>
    </div>
  );
}

