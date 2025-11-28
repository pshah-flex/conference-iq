/**
 * Simplified Spend Extraction Service
 * 
 * Extracts explicit costs only - no estimation, no inference, no industry averages.
 * Only processes costs that are explicitly stated.
 */

import type { ExtractedExhibitor } from './crawler/extractors/exhibitors';
import { extractPricingFromPDF } from './crawler/extractors/pricing';

export interface SpendExtractionResult {
  exhibitor_costs: {
    company_name: string;
    tier: string | null;
    cost: number | null; // Only explicit costs, null if unknown
  }[];
  total_spend: number | null; // Sum of all explicit costs, null if none found
  unknown_count: number; // Count of exhibitors/sponsors without explicit costs
}

/**
 * Extract explicit costs from exhibitor data
 * 
 * Rules:
 * - Only use costs that are explicitly stated (e.g., "Gold Sponsor - $25,000")
 * - Mark as "Unknown" if cost not explicitly stated
 * - No tier inference or cost estimation
 * - No industry averages
 * - No cost ranges
 */
export function extractSpendFromExhibitors(
  exhibitors: ExtractedExhibitor[]
): SpendExtractionResult {
  const exhibitorCosts: SpendExtractionResult['exhibitor_costs'] = [];
  let totalSpend = 0;
  let unknownCount = 0;

  for (const exhibitor of exhibitors) {
    const cost = exhibitor.estimated_cost; // This is only set if explicitly found
    
    if (cost !== null && cost > 0) {
      exhibitorCosts.push({
        company_name: exhibitor.company_name,
        tier: exhibitor.exhibitor_tier_normalized,
        cost,
      });
      totalSpend += cost;
    } else {
      exhibitorCosts.push({
        company_name: exhibitor.company_name,
        tier: exhibitor.exhibitor_tier_normalized,
        cost: null, // Mark as unknown
      });
      unknownCount++;
    }
  }

  return {
    exhibitor_costs: exhibitorCosts,
    total_spend: totalSpend > 0 ? totalSpend : null,
    unknown_count: unknownCount,
  };
}

/**
 * Extract explicit costs from sponsor tier pricing
 * 
 * Used for sponsor packages that list explicit pricing per tier
 */
export function extractSpendFromSponsorTiers(
  sponsorTiers: { tier: string; cost: number }[]
): { tier: string; cost: number }[] {
  // Only return tiers with explicit costs (already filtered by extractor)
  return sponsorTiers.filter(tier => tier.cost > 0);
}

/**
 * Extract spend from PDF pricing document
 * 
 * Attempts to parse PDF for explicit costs only
 */
export async function extractSpendFromPDF(
  pdfBuffer: Buffer
): Promise<{
  explicit_costs: { tier: string; cost: number }[];
  unknown_tiers: string[];
}> {
  try {
    const pricingData = await extractPricingFromPDF(pdfBuffer);
    
    const explicitCosts = pricingData.sponsor_tiers
      .filter(tier => tier.cost > 0)
      .map(tier => ({
        tier: tier.tier,
        cost: tier.cost,
      }));

    // If we have sponsor tiers but some don't have costs, track them
    const unknownTiers: string[] = [];
    
    // Note: We don't infer costs for tiers without explicit pricing
    
    return {
      explicit_costs: explicitCosts,
      unknown_tiers: unknownTiers,
    };
  } catch (error: any) {
    console.error('Error extracting spend from PDF:', error.message);
    return {
      explicit_costs: [],
      unknown_tiers: [],
    };
  }
}

/**
 * Combine spend data from multiple sources
 * 
 * Aggregates explicit costs from exhibitors and sponsor tiers
 */
export function combineSpendData(
  exhibitorSpend: SpendExtractionResult,
  sponsorTierSpend: { tier: string; cost: number }[]
): {
  total_explicit_spend: number | null;
  explicit_costs_by_source: {
    exhibitors: number;
    sponsor_tiers: number;
  };
  unknown_count: number;
} {
  const exhibitorTotal = exhibitorSpend.total_spend || 0;
  const sponsorTotal = sponsorTierSpend.reduce((sum, tier) => sum + tier.cost, 0);
  
  const totalExplicitSpend = exhibitorTotal + sponsorTotal;

  return {
    total_explicit_spend: totalExplicitSpend > 0 ? totalExplicitSpend : null,
    explicit_costs_by_source: {
      exhibitors: exhibitorTotal,
      sponsor_tiers: sponsorTotal,
    },
    unknown_count: exhibitorSpend.unknown_count,
  };
}

/**
 * Format cost for display
 * 
 * Converts numeric cost to formatted string, or returns "Unknown"
 */
export function formatCost(cost: number | null): string {
  if (cost === null) {
    return 'Unknown';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cost);
}

