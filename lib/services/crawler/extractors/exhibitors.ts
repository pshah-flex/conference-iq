/**
 * Exhibitors Extractor
 * 
 * Extracts exhibitor information: company name, tier, explicit costs
 * Only extracts explicit costs (e.g., "Gold Sponsor - $25,000")
 */

import * as cheerio from 'cheerio';

export interface ExtractedExhibitor {
  company_name: string;
  exhibitor_tier_raw: string | null;
  exhibitor_tier_normalized: string | null;
  estimated_cost: number | null; // Only explicit costs, no estimates
}

/**
 * Tier normalization mapping
 */
const TIER_MAPPING: Record<string, string> = {
  'platinum': 'platinum',
  'diamond': 'platinum',
  'titanium': 'platinum',
  'gold': 'gold',
  'silver': 'silver',
  'bronze': 'bronze',
  'copper': 'bronze',
  'standard': 'standard',
  'basic': 'standard',
  'exhibitor': 'standard',
  'sponsor': 'standard',
};

/**
 * Common selectors for exhibitor sections
 */
const EXHIBITOR_SELECTORS = [
  '[class*="exhibitor"]',
  '[class*="sponsor"]',
  '[id*="exhibitor"]',
  '[id*="sponsor"]',
  '.exhibitors',
  '.sponsors',
  'section[class*="exhibitor"]',
  'section[class*="sponsor"]',
];

/**
 * Patterns for extracting explicit costs
 */
const COST_PATTERNS = [
  /\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/, // "$25,000" or "$25,000.00"
  /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:USD|dollars?)/i, // "25,000 USD"
  /(?:cost|price|fee):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i, // "Cost: $25,000"
];

/**
 * Tier patterns
 */
const TIER_PATTERNS = [
  /(platinum|diamond|titanium|gold|silver|bronze|copper|standard|basic)\s*(?:sponsor|tier|level|package)/i,
  /(?:sponsor|tier|level|package):\s*(platinum|diamond|titanium|gold|silver|bronze|copper|standard|basic)/i,
];

/**
 * Normalize tier name
 */
function normalizeTier(tier: string | null): string | null {
  if (!tier) return null;

  const lower = tier.toLowerCase().trim();
  
  // Check direct mapping
  if (TIER_MAPPING[lower]) {
    return TIER_MAPPING[lower];
  }

  // Check if it contains tier keywords
  for (const [key, value] of Object.entries(TIER_MAPPING)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return 'unknown';
}

/**
 * Extract cost from text (only explicit costs)
 */
function extractCost(text: string): number | null {
  for (const pattern of COST_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const numberStr = match[1].replace(/,/g, '');
      const number = parseFloat(numberStr);
      if (!isNaN(number) && number > 0) {
        return Math.round(number); // Return as integer
      }
    }
  }
  return null;
}

/**
 * Extract tier from text
 */
function extractTier(text: string): string | null {
  for (const pattern of TIER_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Extract exhibitors from HTML
 */
export function extractExhibitors(html: string, baseUrl: string): ExtractedExhibitor[] {
  const $ = cheerio.load(html);
  const exhibitors: ExtractedExhibitor[] = [];

  // Find exhibitor/sponsor sections
  let exhibitorElements: any = $();

  for (const selector of EXHIBITOR_SELECTORS) {
    const elements = $(selector);
    if (elements.length > 0) {
      exhibitorElements = elements;
      break;
    }
  }

  // If no specific section found, look for common patterns
  if (exhibitorElements.length === 0) {
    exhibitorElements = $('[class*="card"], [class*="item"], [class*="logo"], li, .grid > div');
  }

  exhibitorElements.each((_: any, element: any) => {
    const $element = $(element);
    const text = $element.text().trim();
    const htmlContent = $element.html() || '';

    // Skip if text is too short
    if (text.length < 3) {
      return;
    }

    // Try to extract company name
    let companyName: string | null = null;

    // Look for company name in heading, strong, or alt text of logo
    const heading = $element.find('h1, h2, h3, h4, h5, h6, strong, b, [class*="name"], [class*="company"]').first().text().trim();
    if (heading && heading.length > 2 && heading.length < 200) {
      companyName = heading;
    }

    // Alternative: look for alt text in logo images
    if (!companyName) {
      const altText = $element.find('img[alt]').attr('alt');
      if (altText && altText.length > 2 && altText.length < 200) {
        companyName = altText;
      }
    }

    // Alternative: extract from text (first capitalized words)
    if (!companyName) {
      const nameMatch = text.match(/^([A-Z][a-zA-Z\s&]+)/);
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim();
        if (candidate.length > 2 && candidate.length < 200) {
          companyName = candidate;
        }
      }
    }

    if (!companyName) {
      return; // Skip if no company name found
    }

    // Extract tier
    const tierRaw = extractTier(text + ' ' + htmlContent);
    const tierNormalized = normalizeTier(tierRaw);

    // Extract cost (only explicit costs)
    const cost = extractCost(text + ' ' + htmlContent);

    exhibitors.push({
      company_name: companyName,
      exhibitor_tier_raw: tierRaw,
      exhibitor_tier_normalized: tierNormalized,
      estimated_cost: cost, // Only explicit costs, null if not found
    });
  });

  // Remove duplicates based on company name
  const uniqueExhibitors = exhibitors.filter((exhibitor, index, self) =>
    index === self.findIndex(e => 
      e.company_name.toLowerCase() === exhibitor.company_name.toLowerCase()
    )
  );

  return uniqueExhibitors;
}

