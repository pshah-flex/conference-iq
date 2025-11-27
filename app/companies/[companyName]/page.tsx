'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompanyIntelligence } from '@/types';
import ExhibitorHistory from '@/app/components/companies/ExhibitorHistory';
import SpeakerHistory from '@/app/components/companies/SpeakerHistory';
import { ArrowLeft, Building2, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyName = decodeURIComponent(params.companyName as string);

  const [companyData, setCompanyData] = useState<CompanyIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);

      try {
        const encodedName = encodeURIComponent(companyName);
        const response = await fetch(`/api/companies/${encodedName}/profile`);

        if (!response.ok) {
          throw new Error('Failed to load company profile');
        }

        const data = await response.json();
        setCompanyData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchCompanyData();
    }
  }, [companyName]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Company not found'}
        </div>
        <Link
          href="/companies"
          className="text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Company Search
        </Link>
      </div>
    );
  }

  const totalConferences =
    companyData.exhibitor_history.length + companyData.speaker_history.length;
  const uniqueConferenceIds = new Set([
    ...companyData.exhibitor_history.map((e) => e.conference_id),
    ...companyData.speaker_history.map((s) => s.conference_id),
  ]);
  const actualTotalConferences = uniqueConferenceIds.size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/companies"
          className="text-indigo-600 hover:text-indigo-500 flex items-center mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Company Search
        </Link>
        <div className="flex items-start">
          <Building2 className="w-8 h-8 text-indigo-600 mr-3 mt-1" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{companyName}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>
                {actualTotalConferences}{' '}
                {actualTotalConferences === 1 ? 'conference' : 'conferences'}
              </span>
              {companyData.exhibitor_history.length > 0 && (
                <span>
                  {companyData.exhibitor_history.length}{' '}
                  {companyData.exhibitor_history.length === 1 ? 'exhibition' : 'exhibitions'}
                </span>
              )}
              {companyData.speaker_history.length > 0 && (
                <span>
                  {companyData.speaker_history.reduce((sum, s) => sum + s.speaker_count, 0)}{' '}
                  speakers
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {companyData.total_spend !== null && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
              <div className="text-sm font-medium text-gray-500">Total Spend</div>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              ${companyData.total_spend.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Explicit costs only
            </p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-2">
            <Building2 className="w-5 h-5 text-gray-400 mr-2" />
            <div className="text-sm font-medium text-gray-500">Exhibitions</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {companyData.exhibitor_history.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-2">
            <Building2 className="w-5 h-5 text-gray-400 mr-2" />
            <div className="text-sm font-medium text-gray-500">Conferences with Speakers</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {companyData.speaker_history.length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExhibitorHistory
          exhibitorHistory={companyData.exhibitor_history}
          totalSpend={companyData.total_spend}
        />
        <SpeakerHistory speakerHistory={companyData.speaker_history} />
      </div>
    </div>
  );
}

