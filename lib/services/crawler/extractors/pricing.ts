/**
 * Pricing Extractor
 * 
 * Extracts pricing information: ticket pricing, sponsor tier pricing
 * Only extracts explicit costs, no estimation
 * Basic PDF parsing for pricing documents
 */

import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';

export interface ExtractedPricing {
  ticket_pricing: {
    early_bird?: number | null;
    regular?: number | null;
    late?: number | null;
    student?: number | null;
    group?: number | null;
  } | null;
  sponsor_tiers: {
    tier: string;
    cost: number;
  }[];
  pricing_url: string | null;
}

/**
 * Patterns for ticket pricing
 */
const TICKET_PRICE_PATTERNS = [
  /(?:early\s*bird|early|super\s*early):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:regular|standard|general):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:late|last\s*minute|on-site):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:student|academic):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:group|bulk|team):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
];

/**
 * Patterns for sponsor tier pricing
 */
const SPONSOR_TIER_PRICE_PATTERNS = [
  /(platinum|diamond|titanium|gold|silver|bronze|copper|standard|basic)\s*(?:sponsor|tier|level|package)[\s:]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:sponsor|tier|level|package)[\s:]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*[-–—]\s*(platinum|diamond|titanium|gold|silver|bronze|copper|standard|basic)/i,
];

/**
 * Extract pricing from HTML
 */
export function extractPricing(html: string, baseUrl: string): ExtractedPricing {
  const $ = cheerio.load(html);
  const result: ExtractedPricing = {
    ticket_pricing: null,
    sponsor_tiers: [],
    pricing_url: null,
  };

  const bodyText = $('body').text();

  // Extract ticket pricing
  const ticketPricing: any = {};
  for (const pattern of TICKET_PRICE_PATTERNS) {
    const match = bodyText.match(pattern);
    if (match) {
      const type = match[0].toLowerCase();
      const priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);

      if (!isNaN(price) && price > 0) {
        if (type.includes('early')) {
          ticketPricing.early_bird = Math.round(price);
        } else if (type.includes('regular') || type.includes('standard') || type.includes('general')) {
          ticketPricing.regular = Math.round(price);
        } else if (type.includes('late') || type.includes('last') || type.includes('on-site')) {
          ticketPricing.late = Math.round(price);
        } else if (type.includes('student') || type.includes('academic')) {
          ticketPricing.student = Math.round(price);
        } else if (type.includes('group') || type.includes('bulk') || type.includes('team')) {
          ticketPricing.group = Math.round(price);
        }
      }
    }
  }

  if (Object.keys(ticketPricing).length > 0) {
    result.ticket_pricing = ticketPricing;
  }

  // Extract sponsor tier pricing
  for (const pattern of SPONSOR_TIER_PRICE_PATTERNS) {
    const matches = [...bodyText.matchAll(new RegExp(pattern.source, 'gi'))];
    for (const match of matches) {
      const tier = match[1] || match[3];
      const priceStr = (match[2] || match[1]).replace(/,/g, '');
      const price = parseFloat(priceStr);

      if (!isNaN(price) && price > 0 && tier) {
        result.sponsor_tiers.push({
          tier: tier.trim().toLowerCase(),
          cost: Math.round(price),
        });
      }
    }
  }

  // Find pricing URL
  const pricingLinks = $('a[href*="pric"], a[href*="ticket"], a[href*="register"], a[href*="cost"]');
  if (pricingLinks.length > 0) {
    const href = pricingLinks.first().attr('href');
    if (href) {
      try {
        const url = new URL(href, baseUrl);
        result.pricing_url = url.toString();
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return result;
}

/**
 * Extract pricing from PDF (basic parsing)
 */
export async function extractPricingFromPDF(pdfBuffer: Buffer): Promise<ExtractedPricing> {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Use the same extraction logic as HTML
    return extractPricing(`<body>${text}</body>`, '');
  } catch (error: any) {
    console.error('Error parsing PDF:', error.message);
    return {
      ticket_pricing: null,
      sponsor_tiers: [],
      pricing_url: null,
    };
  }
}

