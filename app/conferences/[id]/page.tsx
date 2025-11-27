'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Conference, Speaker, Exhibitor } from '@/types';
import BasicInfo from '@/app/components/conferences/BasicInfo';
import ExhibitorList from '@/app/components/conferences/ExhibitorList';
import SpeakerList from '@/app/components/conferences/SpeakerList';
import SpeakerCompanyStats from '@/app/components/conferences/SpeakerCompanyStats';
import CompanySpeakerStats from '@/app/components/speakers/CompanySpeakerStats';
import SeniorityPatterns from '@/app/components/speakers/SeniorityPatterns';
import IndustryDistribution from '@/app/components/speakers/IndustryDistribution';
import PricingInfo from '@/app/components/conferences/PricingInfo';
import Agenda from '@/app/components/conferences/Agenda';
import ContactInfo from '@/app/components/conferences/ContactInfo';
import DataCompleteness from '@/app/components/conferences/DataCompleteness';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ConferenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conferenceId = params.id as string;

  const [conference, setConference] = useState<Conference | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConferenceData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch conference details
        const confResponse = await fetch(`/api/conferences/${conferenceId}`);
        if (!confResponse.ok) {
          throw new Error('Failed to load conference');
        }
        const confData = await confResponse.json();
        setConference(confData);

        // Fetch speakers
        const speakersResponse = await fetch(`/api/conferences/${conferenceId}/speakers`);
        if (speakersResponse.ok) {
          const speakersData = await speakersResponse.json();
          setSpeakers(speakersData);
        }

        // Fetch exhibitors
        const exhibitorsResponse = await fetch(`/api/conferences/${conferenceId}/exhibitors`);
        if (exhibitorsResponse.ok) {
          const exhibitorsData = await exhibitorsResponse.json();
          setExhibitors(exhibitorsData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load conference data');
      } finally {
        setLoading(false);
      }
    };

    if (conferenceId) {
      fetchConferenceData();
    }
  }, [conferenceId]);

  const handleShare = () => {
    if (navigator.share && conference) {
      navigator.share({
        title: conference.name,
        text: `Check out ${conference.name}`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Conference not found'}
        </div>
        <div className="mt-4">
          <Link
            href="/conferences"
            className="text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conferences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/conferences"
          className="text-indigo-600 hover:text-indigo-500 flex items-center mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Conferences
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {conference.name}
            </h1>
            {conference.url && (
              <a
                href={conference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                Visit conference website →
              </a>
            )}
          </div>
          <button
            onClick={handleShare}
            className="ml-4 p-2 rounded-md border border-gray-300 hover:bg-gray-50 flex items-center text-sm text-gray-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <BasicInfo conference={conference} />
          <SpeakerList speakers={speakers} />
          <CompanySpeakerStats speakers={speakers} />
          <SeniorityPatterns speakers={speakers} />
          <IndustryDistribution speakers={speakers} />
          <ExhibitorList exhibitors={exhibitors} />
          <PricingInfo exhibitors={exhibitors} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          <DataCompleteness conference={conference} />
          <Agenda conference={conference} />
          <ContactInfo conference={conference} />
        </div>
      </div>
    </div>
  );
}

