'use client';

import { useState, useEffect } from 'react';
import { Play, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface CrawlLog {
  id: string;
  conference_id: string | null;
  status: 'success' | 'failed' | 'partial';
  data_extracted: any;
  error_message: string | null;
  crawled_at: string;
}

export default function AdminCrawlPage() {
  const [crawlUrl, setCrawlUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState<CrawlLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCrawlLogs();
  }, []);

  const fetchCrawlLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/crawl-logs?limit=50');
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin access required.');
        }
        throw new Error('Failed to fetch crawl logs');
      }
      const data = await response.json();
      setCrawlLogs(data.data || []);
    } catch (error: any) {
      console.error('Error fetching crawl logs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setIsCrawling(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: crawlUrl }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin access required.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger crawl');
      }

      const data = await response.json();
      setSuccess(`Crawl triggered successfully! ${data.note || ''}`);
      setCrawlUrl('');
      
      // Refresh logs after a short delay
      setTimeout(() => {
        fetchCrawlLogs();
      }, 1000);
    } catch (error: any) {
      console.error('Error triggering crawl:', error);
      setError(error.message);
    } finally {
      setIsCrawling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'partial':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Crawl Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manually trigger crawls for conference URLs and view crawl logs.
        </p>
      </div>

      {/* Crawl Trigger Form */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trigger Manual Crawl</h2>
        <form onSubmit={handleCrawl} className="space-y-4">
          <div>
            <label htmlFor="crawlUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Conference URL
            </label>
            <div className="flex space-x-2">
              <input
                id="crawlUrl"
                type="url"
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                placeholder="https://example.com/conference"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isCrawling}
              />
              <button
                type="submit"
                disabled={isCrawling || !crawlUrl.trim()}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCrawling ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Crawl
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}
      </div>

      {/* Crawl Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Crawl Logs</h2>
          <button
            onClick={fetchCrawlLogs}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading crawl logs...</p>
          </div>
        ) : crawlLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No crawl logs yet. Trigger a crawl to see logs here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conference ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crawled At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {crawlLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.conference_id ? (
                        <a
                          href={`/conferences/${log.conference_id}`}
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {log.conference_id.substring(0, 8)}...
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.crawled_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.error_message ? (
                        <div className="max-w-md">
                          <span className="text-red-600">{log.error_message}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

