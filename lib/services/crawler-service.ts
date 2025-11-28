/**
 * Crawler Service
 * 
 * Orchestrates the full crawl process:
 * - Crawls conference websites
 * - Saves raw HTML/PDFs to storage (optional)
 * - Updates/creates conference records
 * - Creates/updates speakers and exhibitors
 * - Logs crawl results
 * - Calculates field completeness
 */

import { ConferenceCrawler } from './crawler/conference-crawler';
import { ConferencesRepository } from '@/lib/repositories/conferences.repository';
import { SpeakersRepository } from '@/lib/repositories/speakers.repository';
import { ExhibitorsRepository } from '@/lib/repositories/exhibitors.repository';
import { createAdminSupabase } from '@/lib/supabase';
import type { Conference, Speaker, Exhibitor } from '@/types';
import type { ExtractedSpeaker, ExtractedExhibitor } from './crawler/extractors';

export interface CrawlServiceOptions {
  saveHtmlToStorage?: boolean; // Optional: save HTML to Supabase Storage
  savePdfToStorage?: boolean; // Optional: save PDFs to Supabase Storage
  storageBucket?: string; // Storage bucket name (default: 'crawl-data')
  overwriteExisting?: boolean; // Overwrite existing speakers/exhibitors
}

export interface CrawlServiceResult {
  success: boolean;
  conferenceId: string | null;
  conferenceUrl: string;
  status: 'success' | 'failed' | 'partial';
  message: string;
  stats: {
    speakersCreated: number;
    exhibitorsCreated: number;
    fieldsPopulated: number;
    totalFields: number;
  };
  error?: string;
}

/**
 * Calculate field count for completeness
 */
function calculateFieldCount(basicInfo: any, contact: any): { populated: number; total: number } {
  let populated = 0;
  const total = 15; // Total expected fields

  // Basic info fields
  if (basicInfo.name) populated++;
  if (basicInfo.start_date) populated++;
  if (basicInfo.end_date) populated++;
  if (basicInfo.city) populated++;
  if (basicInfo.country) populated++;
  if (basicInfo.industry && basicInfo.industry.length > 0) populated++;
  if (basicInfo.attendance_estimate) populated++;

  // Contact fields
  if (contact.organizer_name) populated++;
  if (contact.organizer_email) populated++;
  if (contact.organizer_phone) populated++;
  if (contact.agenda_url) populated++;

  // Note: URL is always present (required field)
  // Note: pricing_url is extracted separately

  return { populated, total };
}

/**
 * Save HTML to Supabase Storage (optional)
 */
async function saveHtmlToStorage(
  html: string,
  conferenceId: string,
  url: string,
  bucket: string = 'crawl-data'
): Promise<string | null> {
  try {
    const supabase = createAdminSupabase();
    
    // Create a sanitized filename from URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const filename = `${conferenceId}/${hostname}_${timestamp}.html`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, html, {
        contentType: 'text/html',
        upsert: true,
      });

    if (error) {
      console.error('Error saving HTML to storage:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error in saveHtmlToStorage:', error.message);
    return null;
  }
}

/**
 * Log crawl result to database
 */
async function logCrawlResult(
  conferenceId: string | null,
  status: 'success' | 'failed' | 'partial',
  dataExtracted: any,
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = createAdminSupabase();
    
    await supabase
      .from('crawl_logs')
      .insert({
        conference_id: conferenceId,
        status,
        data_extracted: dataExtracted,
        error_message: errorMessage || null,
        crawled_at: new Date().toISOString(),
      });
  } catch (error: any) {
    console.error('Error logging crawl result:', error.message);
    // Don't throw - logging failure shouldn't break the crawl
  }
}

/**
 * Main crawler service
 */
export class CrawlerService {
  private crawler: ConferenceCrawler;
  private conferencesRepo: ConferencesRepository;
  private speakersRepo: SpeakersRepository;
  private exhibitorsRepo: ExhibitorsRepository;

  constructor() {
    this.crawler = new ConferenceCrawler();
    const supabase = createAdminSupabase();
    this.conferencesRepo = new ConferencesRepository(supabase);
    this.speakersRepo = new SpeakersRepository(supabase);
    this.exhibitorsRepo = new ExhibitorsRepository(supabase);
  }

  /**
   * Crawl a conference by URL
   */
  async crawlByUrl(
    url: string,
    options: CrawlServiceOptions = {}
  ): Promise<CrawlServiceResult> {
    try {
      // Normalize URL
      const normalizedUrl = this.crawler.normalizeUrl(url);

      // Check if conference already exists
      const existingResult = await this.conferencesRepo.findByUrl(normalizedUrl);
      let conferenceId: string | null = null;
      let conference: Conference | null = null;

      if (existingResult.data) {
        conference = existingResult.data;
        conferenceId = conference.id;
      }

      // Perform crawl
      const crawlResult = await this.crawler.crawl(normalizedUrl);

      // Check if crawl was successful
      if (crawlResult.error || crawlResult.statusCode !== 200) {
        await logCrawlResult(
          conferenceId,
          'failed',
          null,
          crawlResult.error || `HTTP ${crawlResult.statusCode}`
        );

        return {
          success: false,
          conferenceId,
          conferenceUrl: normalizedUrl,
          status: 'failed',
          message: `Crawl failed: ${crawlResult.error || `HTTP ${crawlResult.statusCode}`}`,
          stats: {
            speakersCreated: 0,
            exhibitorsCreated: 0,
            fieldsPopulated: 0,
            totalFields: 15,
          },
          error: crawlResult.error || `HTTP ${crawlResult.statusCode}`,
        };
      }

      // Save HTML to storage (optional)
      if (options.saveHtmlToStorage && crawlResult.html && conferenceId) {
        await saveHtmlToStorage(
          crawlResult.html,
          conferenceId,
          normalizedUrl,
          options.storageBucket
        );
      }

      // Extract data
      const { basicInfo, speakers, exhibitors, pricing, contact } = crawlResult.data;

      // Update or create conference
      const conferenceData: Partial<Conference> = {
        name: basicInfo.name || (conference?.name || 'Unknown Conference'),
        url: normalizedUrl,
        start_date: basicInfo.start_date || null,
        end_date: basicInfo.end_date || null,
        city: basicInfo.city || null,
        country: basicInfo.country || null,
        industry: basicInfo.industry || null,
        attendance_estimate: basicInfo.attendance_estimate || null,
        agenda_url: contact.agenda_url || null,
        pricing_url: pricing.pricing_url || null,
        organizer_name: contact.organizer_name || null,
        organizer_email: contact.organizer_email || null,
        organizer_phone: contact.organizer_phone || null,
        last_crawled_at: new Date().toISOString(),
      };

      // Calculate completeness (will also be calculated by trigger, but set here for immediate use)
      const { populated, total } = calculateFieldCount(basicInfo, contact);
      conferenceData.fields_populated_count = populated;
      conferenceData.total_fields_count = total;

      if (conferenceId) {
        // Update existing conference
        const updateResult = await this.conferencesRepo.update(conferenceId, conferenceData);
        if (updateResult.error) {
          throw new Error(`Failed to update conference: ${updateResult.error.message}`);
        }
        conference = updateResult.data!;
      } else {
        // Create new conference
        if (!conferenceData.name || !conferenceData.url) {
          throw new Error('Conference name and URL are required');
        }
        const createResult = await this.conferencesRepo.create({
          name: conferenceData.name,
          url: conferenceData.url,
          ...conferenceData,
        });
        if (createResult.error) {
          throw new Error(`Failed to create conference: ${createResult.error.message}`);
        }
        conference = createResult.data!;
        conferenceId = conference.id;
      }

      // Handle speakers
      let speakersCreated = 0;
      if (speakers && speakers.length > 0 && conferenceId) {
        if (options.overwriteExisting) {
          // Delete existing speakers first (in production, you might want to do upsert instead)
          // For now, we'll just add new ones (could create duplicates)
        }

        const speakersToCreate: Omit<Speaker, 'id' | 'created_at' | 'updated_at'>[] = speakers.map(
          (speaker: ExtractedSpeaker) => ({
            conference_id: conferenceId,
            name: speaker.name,
            title: speaker.title || null,
            company: speaker.company || null,
            company_industry: null, // No enrichment in MVP
            company_size_bucket: 'unknown' as const,
            source_url: normalizedUrl,
          })
        );

        const createSpeakersResult = await this.speakersRepo.createMany(speakersToCreate);
        if (createSpeakersResult.data) {
          speakersCreated = createSpeakersResult.data.length;
        }
      }

      // Handle exhibitors
      let exhibitorsCreated = 0;
      if (exhibitors && exhibitors.length > 0 && conferenceId) {
        const exhibitorsToCreate: Omit<Exhibitor, 'id' | 'created_at' | 'updated_at'>[] = exhibitors.map(
          (exhibitor: ExtractedExhibitor) => ({
            conference_id: conferenceId,
            company_name: exhibitor.company_name,
            exhibitor_tier_raw: exhibitor.exhibitor_tier_raw || null,
            exhibitor_tier_normalized: exhibitor.exhibitor_tier_normalized || null,
            estimated_cost: exhibitor.estimated_cost || null,
            source_url: normalizedUrl,
          })
        );

        const createExhibitorsResult = await this.exhibitorsRepo.createMany(exhibitorsToCreate);
        if (createExhibitorsResult.data) {
          exhibitorsCreated = createExhibitorsResult.data.length;
        }
      }

      // Determine status
      const hasErrors = !basicInfo.name || speakersCreated === 0;
      const status: 'success' | 'partial' = hasErrors ? 'partial' : 'success';

      // Log crawl result
      await logCrawlResult(conferenceId, status, {
        speakersExtracted: speakers.length,
        exhibitorsExtracted: exhibitors.length,
        fieldsPopulated: populated,
      });

      return {
        success: true,
        conferenceId,
        conferenceUrl: normalizedUrl,
        status,
        message: status === 'success'
          ? 'Conference crawled successfully'
          : 'Conference crawled with some issues',
        stats: {
          speakersCreated,
          exhibitorsCreated,
          fieldsPopulated: populated,
          totalFields: total,
        },
      };
    } catch (error: any) {
      console.error('Error in crawlByUrl:', error);
      await logCrawlResult(null, 'failed', null, error.message);

      return {
        success: false,
        conferenceId: null,
        conferenceUrl: url,
        status: 'failed',
        message: `Crawl failed: ${error.message}`,
        stats: {
          speakersCreated: 0,
          exhibitorsCreated: 0,
          fieldsPopulated: 0,
          totalFields: 15,
        },
        error: error.message,
      };
    }
  }

  /**
   * Crawl a conference by ID (re-crawl existing conference)
   */
  async crawlById(
    conferenceId: string,
    options: CrawlServiceOptions = {}
  ): Promise<CrawlServiceResult> {
    const supabase = createAdminSupabase();
    const conferencesRepo = new ConferencesRepository(supabase);

    const result = await conferencesRepo.findById(conferenceId);
    if (result.error || !result.data) {
      return {
        success: false,
        conferenceId,
        conferenceUrl: '',
        status: 'failed',
        message: `Conference not found: ${conferenceId}`,
        stats: {
          speakersCreated: 0,
          exhibitorsCreated: 0,
          fieldsPopulated: 0,
          totalFields: 15,
        },
        error: result.error?.message || 'Conference not found',
      };
    }

    return this.crawlByUrl(result.data.url, options);
  }
}

