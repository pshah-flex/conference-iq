/**
 * Basic Info Extractor
 * 
 * Extracts basic conference information: name, dates, location, URL
 */

import * as cheerio from 'cheerio';
import { parse, isValid, format } from 'date-fns';

export interface BasicInfo {
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  country: string | null;
  attendance_estimate: number | null;
  industry: string[] | null;
}

/**
 * Common date patterns found on conference websites
 */
const DATE_PATTERNS = [
  /(\w{3,9}\s+\d{1,2},?\s+\d{4})\s*[-–—]\s*(\w{3,9}\s+\d{1,2},?\s+\d{4})/i, // "January 15, 2024 - February 20, 2024"
  /(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{1,2}\/\d{4})/, // "01/15/2024 - 02/20/2024"
  /(\d{1,2}-\d{1,2}-\d{4})\s*[-–—]\s*(\d{1,2}-\d{1,2}-\d{4})/, // "01-15-2024 - 02-20-2024"
  /(\w{3,9}\s+\d{1,2},?\s+\d{4})/i, // Single date "January 15, 2024"
  /(\d{1,2}\/\d{1,2}\/\d{4})/, // Single date "01/15/2024"
];

/**
 * Common location patterns
 */
const LOCATION_PATTERNS = [
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // "San Francisco, United States"
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})/, // "San Francisco, CA"
];

/**
 * Attendance estimate patterns
 */
const ATTENDANCE_PATTERNS = [
  /~?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:attendees?|participants?|delegates?)/i,
  /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\+?\s*(?:attendees?|participants?|delegates?)/i,
  /(?:attendees?|participants?|delegates?):\s*~?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
];

/**
 * Industry/topic keywords
 */
const INDUSTRY_KEYWORDS = [
  'technology', 'tech', 'software', 'ai', 'artificial intelligence', 'machine learning',
  'healthcare', 'health', 'medical', 'pharma', 'pharmaceutical',
  'finance', 'fintech', 'banking', 'investment',
  'marketing', 'advertising', 'branding', 'digital marketing',
  'legal', 'law', 'compliance',
  'education', 'edtech',
  'retail', 'ecommerce', 'e-commerce',
  'manufacturing', 'industrial',
  'energy', 'renewable', 'sustainability',
  'media', 'entertainment',
  'consulting', 'professional services',
];

/**
 * Parse a date string into ISO format
 */
function parseDate(dateStr: string): string | null {
  // Try common date formats
  const formats = [
    'MMMM d, yyyy',
    'MMM d, yyyy',
    'MM/dd/yyyy',
    'M/d/yyyy',
    'dd-MM-yyyy',
    'd-M-yyyy',
    'yyyy-MM-dd',
  ];

  for (const format of formats) {
    try {
      const parsed = parse(dateStr.trim(), format, new Date());
      if (isValid(parsed)) {
        return parsed.toISOString().split('T')[0]; // Return YYYY-MM-DD format
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Extract basic conference information from HTML
 */
export function extractBasicInfo(html: string, url: string): BasicInfo {
  const $ = cheerio.load(html);
  const result: BasicInfo = {
    name: null,
    start_date: null,
    end_date: null,
    city: null,
    country: null,
    attendance_estimate: null,
    industry: null,
  };

  // Extract conference name
  // Try common selectors for conference name
  const nameSelectors = [
    'h1',
    '.conference-name',
    '.event-name',
    '[class*="title"]',
    '[class*="name"]',
    'title',
  ];

  for (const selector of nameSelectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 5 && text.length < 200) {
      result.name = text;
      break;
    }
  }

  // If no name found, try title tag
  if (!result.name) {
    const title = $('title').text().trim();
    if (title) {
      // Remove common suffixes like " | Home", " - Conference", etc.
      result.name = title
        .replace(/\s*[-|]\s*(Home|About|Register|Contact).*$/i, '')
        .trim();
    }
  }

  // Extract dates
  const bodyText = $('body').text();
  for (const pattern of DATE_PATTERNS) {
    const match = bodyText.match(pattern);
    if (match) {
      if (match[2]) {
        // Date range
        const startDate = parseDate(match[1]);
        const endDate = parseDate(match[2]);
        if (startDate) result.start_date = startDate;
        if (endDate) result.end_date = endDate;
      } else {
        // Single date
        const date = parseDate(match[1]);
        if (date) {
          result.start_date = date;
          result.end_date = date; // Same day conference
        }
      }
      break;
    }
  }

  // Extract location
  const locationSelectors = [
    '[class*="location"]',
    '[class*="venue"]',
    '[class*="address"]',
    '[id*="location"]',
    '[id*="venue"]',
  ];

  let locationText = '';
  for (const selector of locationSelectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length < 200) {
      locationText = text;
      break;
    }
  }

  // If no location found in specific selectors, search body text
  if (!locationText) {
    for (const pattern of LOCATION_PATTERNS) {
      const match = bodyText.match(pattern);
      if (match) {
        locationText = match[0];
        break;
      }
    }
  }

  // Parse location into city and country
  if (locationText) {
    const locationMatch = locationText.match(LOCATION_PATTERNS[0]);
    if (locationMatch) {
      result.city = locationMatch[1].trim();
      result.country = locationMatch[2].trim();
    } else {
      // Try to extract city from comma-separated location
      const parts = locationText.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        result.city = parts[0];
        result.country = parts.slice(1).join(', ');
      } else {
        result.city = locationText;
      }
    }
  }

  // Extract attendance estimate
  for (const pattern of ATTENDANCE_PATTERNS) {
    const match = bodyText.match(pattern);
    if (match) {
      const numberStr = match[1].replace(/,/g, '');
      const number = parseInt(numberStr, 10);
      if (!isNaN(number) && number > 0) {
        result.attendance_estimate = number;
        break;
      }
    }
  }

  // Extract industry keywords
  const industries: string[] = [];
  const lowerBodyText = bodyText.toLowerCase();
  for (const keyword of INDUSTRY_KEYWORDS) {
    if (lowerBodyText.includes(keyword)) {
      // Normalize keyword
      const normalized = keyword
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      if (!industries.includes(normalized)) {
        industries.push(normalized);
      }
    }
  }
  if (industries.length > 0) {
    result.industry = industries;
  }

  return result;
}

