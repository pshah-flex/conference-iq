/**
 * Contact Extractor
 * 
 * Extracts organizer contact information and agenda URL
 * Stores agenda URL only, doesn't parse content
 */

import * as cheerio from 'cheerio';

export interface ExtractedContact {
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  agenda_url: string | null;
}

/**
 * Email pattern
 */
const EMAIL_PATTERN = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

/**
 * Phone patterns
 */
const PHONE_PATTERNS = [
  /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/, // US format
  /(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/, // International format
];

/**
 * Common selectors for contact information
 */
const CONTACT_SELECTORS = [
  '[class*="contact"]',
  '[class*="organizer"]',
  '[id*="contact"]',
  '[id*="organizer"]',
  '.contact',
  '.organizer',
  'section[class*="contact"]',
  'section[class*="organizer"]',
];

/**
 * Common selectors for agenda/schedule
 */
const AGENDA_SELECTORS = [
  'a[href*="agenda"]',
  'a[href*="schedule"]',
  'a[href*="program"]',
  'a[href*="timetable"]',
  '[class*="agenda"] a',
  '[class*="schedule"] a',
  '[class*="program"] a',
];

/**
 * Extract contact information from HTML
 */
export function extractContact(html: string, baseUrl: string): ExtractedContact {
  const $ = cheerio.load(html);
  const result: ExtractedContact = {
    organizer_name: null,
    organizer_email: null,
    organizer_phone: null,
    agenda_url: null,
  };

  // Find contact section
  let contactSection: cheerio.Cheerio<cheerio.Element> = $();

  for (const selector of CONTACT_SELECTORS) {
    const elements = $(selector);
    if (elements.length > 0) {
      contactSection = elements.first();
      break;
    }
  }

  // If no contact section found, search entire page
  if (contactSection.length === 0) {
    contactSection = $('body');
  }

  const contactText = contactSection.text();

  // Extract organizer name
  const nameSelectors = [
    '[class*="name"]',
    '[class*="organizer"]',
    'h1, h2, h3',
    'strong, b',
  ];

  for (const selector of nameSelectors) {
    const text = contactSection.find(selector).first().text().trim();
    if (text && text.length > 2 && text.length < 200) {
      // Check if it looks like a name (not an email or phone)
      if (!text.includes('@') && !text.match(/\d{3}/)) {
        result.organizer_name = text;
        break;
      }
    }
  }

  // Extract email
  const emailMatch = contactText.match(EMAIL_PATTERN);
  if (emailMatch && emailMatch[1]) {
    result.organizer_email = emailMatch[1];
  }

  // Also check mailto links
  if (!result.organizer_email) {
    const mailtoLink = contactSection.find('a[href^="mailto:"]').first().attr('href');
    if (mailtoLink) {
      const email = mailtoLink.replace('mailto:', '').split('?')[0];
      result.organizer_email = email;
    }
  }

  // Extract phone
  for (const pattern of PHONE_PATTERNS) {
    const match = contactText.match(pattern);
    if (match && match[0]) {
      result.organizer_phone = match[0].trim();
      break;
    }
  }

  // Also check tel links
  if (!result.organizer_phone) {
    const telLink = contactSection.find('a[href^="tel:"]').first().attr('href');
    if (telLink) {
      result.organizer_phone = telLink.replace('tel:', '').trim();
    }
  }

  // Extract agenda URL
  for (const selector of AGENDA_SELECTORS) {
    const link = $(selector).first();
    if (link.length > 0) {
      const href = link.attr('href');
      if (href) {
        try {
          const url = new URL(href, baseUrl);
          result.agenda_url = url.toString();
          break;
        } catch {
          // Invalid URL, continue
        }
      }
    }
  }

  // Alternative: look for agenda in page links
  if (!result.agenda_url) {
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().toLowerCase();
      
      if (href && (text.includes('agenda') || text.includes('schedule') || text.includes('program'))) {
        try {
          const url = new URL(href, baseUrl);
          result.agenda_url = url.toString();
          return false; // Break the loop
        } catch {
          // Invalid URL, continue
        }
      }
    });
  }

  return result;
}

