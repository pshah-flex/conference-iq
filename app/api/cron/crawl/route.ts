/**
 * Vercel Cron Job: Conference Crawler
 * 
 * Runs periodically to crawl conferences that need updates:
 * - Conferences that have never been crawled
 * - Conferences last crawled more than 30 days ago
 * - Upcoming conferences (within 90 days) that need fresh data
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/crawl",
 *     "schedule": "0 2 * * *" // Daily at 2 AM UTC
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { CrawlerService } from '@/lib/services/crawler-service';
import { createAdminSupabase } from '@/lib/supabase';
import { ConferencesRepository } from '@/lib/repositories/conferences.repository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max (Vercel limit)

interface CronAuthHeader {
  authorization?: string;
}

/**
 * Verify cron job authentication
 */
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow requests without auth header
  if (process.env.NODE_ENV === 'development' && !cronSecret) {
    return true;
  }

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return false;
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return false;
  }

  return true;
}

/**
 * Get conferences that need to be crawled
 */
async function getConferencesToCrawl() {
  const supabase = createAdminSupabase();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Get conferences that need to be crawled:
  // 1. Have never been crawled (last_crawled_at IS NULL), OR
  // 2. Were last crawled more than 30 days ago
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
  
  const { data: conferences, error } = await supabase
    .from('conferences')
    .select('id, url, name, last_crawled_at, start_date')
    .or(`last_crawled_at.is.null,last_crawled_at.lt.${thirtyDaysAgoISO}`)
    .order('last_crawled_at', { ascending: true, nullsFirst: true })
    .limit(10); // Limit to 10 per cron run to avoid timeout

  if (error) {
    console.error('Error fetching conferences to crawl:', error);
    return [];
  }

  return conferences || [];
}

/**
 * GET handler for cron job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyCronAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕷️ Starting scheduled crawl job...');

    const crawlerService = new CrawlerService();
    const conferencesToCrawl = await getConferencesToCrawl();

    if (conferencesToCrawl.length === 0) {
      console.log('✅ No conferences need crawling at this time');
      return NextResponse.json({
        success: true,
        message: 'No conferences need crawling',
        crawled: 0,
        results: [],
      });
    }

    console.log(`📋 Found ${conferencesToCrawl.length} conference(s) to crawl`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Crawl each conference (limit to avoid timeout)
    for (const conference of conferencesToCrawl) {
      try {
        console.log(`🕷️ Crawling: ${conference.name} (${conference.url})`);
        
        const result = await crawlerService.crawlByUrl(conference.url, {
          saveHtmlToStorage: false, // Don't save HTML to storage in cron jobs (can be enabled later)
          savePdfToStorage: false,
          overwriteExisting: false,
        });

        results.push({
          conferenceId: conference.id,
          conferenceName: conference.name,
          url: conference.url,
          status: result.status,
          success: result.success,
          stats: result.stats,
        });

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }

        // Add a small delay between crawls to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
      } catch (error: any) {
        console.error(`❌ Error crawling ${conference.url}:`, error.message);
        failureCount++;
        results.push({
          conferenceId: conference.id,
          conferenceName: conference.name,
          url: conference.url,
          status: 'failed',
          success: false,
          error: error.message,
        });
      }
    }

    console.log(`✅ Crawl job completed: ${successCount} succeeded, ${failureCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Crawled ${conferencesToCrawl.length} conference(s)`,
      crawled: conferencesToCrawl.length,
      successCount,
      failureCount,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error in crawl cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for manual trigger (admin only)
 */
export async function POST(request: NextRequest) {
  // For manual triggers, require admin authentication instead of cron secret
  try {
    const { requireAdmin } = await import('@/lib/utils/auth');
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Use the same logic as GET
  return GET(request);
}

