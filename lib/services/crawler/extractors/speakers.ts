/**
 * Speakers Extractor
 * 
 * Extracts speaker information: name, title, company
 * Uses pattern matching for parsing various website structures
 */

import * as cheerio from 'cheerio';

export interface ExtractedSpeaker {
  name: string;
  title: string | null;
  company: string | null;
}

/**
 * Common selectors for speaker sections
 */
const SPEAKER_SELECTORS = [
  '[class*="speaker"]',
  '[class*="presenter"]',
  '[id*="speaker"]',
  '[id*="presenter"]',
  '.speakers',
  '.presenters',
  'section[class*="speaker"]',
];

/**
 * Common patterns for speaker information
 */
const SPEAKER_NAME_PATTERNS = [
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // "John Smith"
  /([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)/, // "John A. Smith"
];

const TITLE_PATTERNS = [
  /(?:title|position|role):\s*(.+?)(?:\n|$|,)/i,
  /(?:VP|Vice President|President|CEO|CTO|CFO|Director|Manager|Lead|Head|Chief)/i,
];

const COMPANY_PATTERNS = [
  /(?:company|organization|firm|corporation):\s*(.+?)(?:\n|$|,)/i,
  /at\s+([A-Z][a-zA-Z\s&]+)/i,
  /from\s+([A-Z][a-zA-Z\s&]+)/i,
];

/**
 * Extract speakers from HTML
 */
export function extractSpeakers(html: string, baseUrl: string): ExtractedSpeaker[] {
  const $ = cheerio.load(html);
  const speakers: ExtractedSpeaker[] = [];

  // Find speaker sections
  let speakerElements: any = $();

  for (const selector of SPEAKER_SELECTORS) {
    const elements = $(selector);
    if (elements.length > 0) {
      speakerElements = elements;
      break;
    }
  }

  // If no specific speaker section found, look for common patterns
  if (speakerElements.length === 0) {
    // Look for cards or list items that might contain speaker info
    speakerElements = $('[class*="card"], [class*="item"], [class*="person"], li, .grid > div');
  }

  speakerElements.each((_: any, element: any) => {
    const $element = $(element);
    const text = $element.text().trim();

    // Skip if text is too short or too long (likely not a speaker entry)
    if (text.length < 5 || text.length > 500) {
      return;
    }

    // Try to extract name
    let name: string | null = null;
    for (const pattern of SPEAKER_NAME_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        // Validate: should be 2-4 words, start with capital letter
        const words = candidate.split(/\s+/);
        if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Z]/.test(w))) {
          name = candidate;
          break;
        }
      }
    }

    // Alternative: look for name in heading or strong tags
    if (!name) {
      const heading = $element.find('h1, h2, h3, h4, h5, h6, strong, b').first().text().trim();
      if (heading && heading.length > 5 && heading.length < 100) {
        const words = heading.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          name = heading;
        }
      }
    }

    if (!name) {
      return; // Skip if no name found
    }

    // Extract title
    let title: string | null = null;
    for (const pattern of TITLE_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        // Clean up common prefixes
        title = title.replace(/^(title|position|role):\s*/i, '').trim();
        break;
      }
    }

    // Alternative: look for title in specific elements
    if (!title) {
      const titleElement = $element.find('[class*="title"], [class*="position"], [class*="role"]').first();
      if (titleElement.length > 0) {
        title = titleElement.text().trim();
      }
    }

    // Extract company
    let company: string | null = null;
    for (const pattern of COMPANY_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        company = match[1].trim();
        // Clean up common prefixes
        company = company.replace(/^(company|organization|firm|corporation|at|from):\s*/i, '').trim();
        break;
      }
    }

    // Alternative: look for company in specific elements
    if (!company) {
      const companyElement = $element.find('[class*="company"], [class*="organization"], [class*="firm"]').first();
      if (companyElement.length > 0) {
        company = companyElement.text().trim();
      }
    }

    // If we have at least a name, add the speaker
    if (name) {
      speakers.push({
        name,
        title: title || null,
        company: company || null,
      });
    }
  });

  // Remove duplicates based on name
  const uniqueSpeakers = speakers.filter((speaker, index, self) =>
    index === self.findIndex(s => s.name.toLowerCase() === speaker.name.toLowerCase())
  );

  return uniqueSpeakers;
}

