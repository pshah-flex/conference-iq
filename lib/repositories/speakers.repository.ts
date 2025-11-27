// Speaker repository

import { BaseRepository } from './base.repository';
import type { Speaker, RepositoryResult } from './types';

export interface CompanyStats {
  company: string;
  count: number;
}

export class SpeakersRepository extends BaseRepository {
  /**
   * Find all speakers for a conference
   */
  async findByConferenceId(conferenceId: string): Promise<RepositoryResult<Speaker[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .eq('conference_id', conferenceId)
        .order('name', { ascending: true });
      
      return { data, error };
    });
  }

  /**
   * Find all speakers from a specific company
   */
  async findByCompany(companyName: string): Promise<RepositoryResult<Speaker[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .ilike('company', `%${companyName}%`)
        .order('name', { ascending: true });
      
      return { data, error };
    });
  }

  /**
   * Create multiple speakers at once
   */
  async createMany(speakers: Omit<Speaker, 'id' | 'created_at' | 'updated_at'>[]): Promise<RepositoryResult<Speaker[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('speakers')
        .insert(speakers)
        .select();
      
      return { data, error };
    });
  }

  /**
   * Get company statistics for a conference (group by company, count per company)
   */
  async getCompanyStats(conferenceId: string): Promise<RepositoryResult<CompanyStats[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      // Use SQL to group and count
      const { data, error } = await supabase.rpc('get_speaker_company_stats', {
        p_conference_id: conferenceId,
      });

      // If RPC doesn't exist, use a query approach
      if (error && error.code === '42883') {
        // Function doesn't exist, use query instead
        const { data: speakers, error: queryError } = await supabase
          .from('speakers')
          .select('company')
          .eq('conference_id', conferenceId)
          .not('company', 'is', null);

        if (queryError) {
          return { data: null, error: queryError };
        }

        // Group and count in JavaScript
        const statsMap = new Map<string, number>();
        speakers?.forEach((speaker) => {
          if (speaker.company) {
            const count = statsMap.get(speaker.company) || 0;
            statsMap.set(speaker.company, count + 1);
          }
        });

        const stats: CompanyStats[] = Array.from(statsMap.entries()).map(([company, count]) => ({
          company,
          count,
        }));

        return { data: stats, error: null };
      }

      return { data, error };
    });
  }
}

