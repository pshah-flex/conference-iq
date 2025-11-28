/**
 * Conference Crawler
 * 
 * Main crawler for extracting conference information from websites.
 * Extends BaseCrawler and implements conference-specific crawling logic.
 */

import { BaseCrawler, CrawlOptions, CrawlResult } from './base-crawler';

export interface ConferenceCrawlResult {
  url: string;
  html: string;
  statusCode: number;
  error?: string;
  timestamp: Date;
  // Extracted data will be populated by extractors
  data?: {
    basicInfo?: any;
    speakers?: any[];
    exhibitors?: any[];
    pricing?: any;
    contact?: any;
  };
}

export class ConferenceCrawler extends BaseCrawler {
  /**
   * Crawl a conference website and extract data
   */
  async crawl(url: string, options: CrawlOptions = {}): Promise<ConferenceCrawlResult> {
    // Default options for conference crawling
    const crawlOptions: CrawlOptions = {
      timeout: 60000, // 60 seconds for conference sites (may have heavy content)
      waitFor: 3000, // 3 seconds to ensure JavaScript-rendered content loads
      respectRobotsTxt: true, // Always respect robots.txt
      ...options,
    };

    // Fetch the page
    const result: CrawlResult = await this.fetchPage(url, crawlOptions);

    // Convert to ConferenceCrawlResult
    const conferenceResult: ConferenceCrawlResult = {
      url: result.url,
      html: result.html,
      statusCode: result.statusCode,
      error: result.error,
      timestamp: result.timestamp,
      data: {},
    };

    // If there was an error fetching the page, return early
    if (result.error || result.statusCode !== 200) {
      return conferenceResult;
    }

    // Data extraction will be done by separate extractor modules
    // For now, we just return the HTML - extractors will process it later
    
    return conferenceResult;
  }

  /**
   * Check if a URL is a valid conference website
   */
  isValidConferenceUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Basic validation - must be HTTP/HTTPS
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL (remove fragments, trailing slashes, etc.)
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      urlObj.hash = ''; // Remove fragment
      urlObj.searchParams.sort(); // Sort query params for consistency
      
      let pathname = urlObj.pathname;
      // Remove trailing slash unless it's the root
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      urlObj.pathname = pathname;

      return urlObj.toString();
    } catch {
      return url;
    }
  }
}

