/**
 * Conference Crawler
 * 
 * Main crawler for extracting conference information from websites.
 * Extends BaseCrawler and implements conference-specific crawling logic.
 */

import { BaseCrawler, CrawlOptions, CrawlResult } from './base-crawler';
import {
  extractBasicInfo,
  extractSpeakers,
  extractExhibitors,
  extractPricing,
  extractContact,
  type BasicInfo,
  type ExtractedSpeaker,
  type ExtractedExhibitor,
  type ExtractedPricing,
  type ExtractedContact,
} from './extractors';

export interface ConferenceCrawlResult {
  url: string;
  html: string;
  statusCode: number;
  error?: string;
  timestamp: Date;
  // Extracted data
  data: {
    basicInfo: BasicInfo;
    speakers: ExtractedSpeaker[];
    exhibitors: ExtractedExhibitor[];
    pricing: ExtractedPricing;
    contact: ExtractedContact;
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

    // Default empty data structure
    const defaultData = {
      basicInfo: {
        name: null,
        start_date: null,
        end_date: null,
        city: null,
        country: null,
        attendance_estimate: null,
        industry: null,
      },
      speakers: [] as ExtractedSpeaker[],
      exhibitors: [] as ExtractedExhibitor[],
      pricing: {
        ticket_pricing: null,
        sponsor_tiers: [],
        pricing_url: null,
      },
      contact: {
        organizer_name: null,
        organizer_email: null,
        organizer_phone: null,
        agenda_url: null,
      },
    };

    // Convert to ConferenceCrawlResult
    const conferenceResult: ConferenceCrawlResult = {
      url: result.url,
      html: result.html,
      statusCode: result.statusCode,
      error: result.error,
      timestamp: result.timestamp,
      data: defaultData,
    };

    // If there was an error fetching the page, return early
    if (result.error || result.statusCode !== 200) {
      return conferenceResult;
    }

    // Extract data using extractor modules
    const basicInfo = extractBasicInfo(result.html, url);
    const speakers = extractSpeakers(result.html, url);
    const exhibitors = extractExhibitors(result.html, url);
    const pricing = extractPricing(result.html, url);
    const contact = extractContact(result.html, url);

    conferenceResult.data = {
      basicInfo,
      speakers,
      exhibitors,
      pricing,
      contact,
    };
    
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

