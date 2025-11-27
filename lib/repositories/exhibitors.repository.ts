// Exhibitor repository

import { BaseRepository } from './base.repository';
import type { Exhibitor, RepositoryResult } from './types';

export interface TierDistribution {
  tier: string;
  count: number;
}

export class ExhibitorsRepository extends BaseRepository {
  /**
   * Find all exhibitors for a conference
   */
  async findByConferenceId(conferenceId: string): Promise<RepositoryResult<Exhibitor[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('conference_id', conferenceId)
        .order('company_name', { ascending: true });
      
      return { data, error };
    });
  }

  /**
   * Find all exhibitors from a specific company
   */
  async findByCompany(companyName: string): Promise<RepositoryResult<Exhibitor[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .ilike('company_name', `%${companyName}%`)
        .order('created_at', { ascending: false });
      
      return { data, error };
    });
  }

  /**
   * Create multiple exhibitors at once
   */
  async createMany(exhibitors: Omit<Exhibitor, 'id' | 'created_at' | 'updated_at'>[]): Promise<RepositoryResult<Exhibitor[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('exhibitors')
        .insert(exhibitors)
        .select();
      
      return { data, error };
    });
  }

  /**
   * Get tier distribution for a conference (simple tier counts)
   */
  async getTierDistribution(conferenceId: string): Promise<RepositoryResult<TierDistribution[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data: exhibitors, error } = await supabase
        .from('exhibitors')
        .select('exhibitor_tier_normalized')
        .eq('conference_id', conferenceId);

      if (error) {
        return { data: null, error };
      }

      // Group and count by tier
      const tierMap = new Map<string, number>();
      exhibitors?.forEach((exhibitor) => {
        const tier = exhibitor.exhibitor_tier_normalized || 'unknown';
        const count = tierMap.get(tier) || 0;
        tierMap.set(tier, count + 1);
      });

      const distribution: TierDistribution[] = Array.from(tierMap.entries()).map(([tier, count]) => ({
        tier,
        count,
      }));

      return { data: distribution, error: null };
    });
  }
}

