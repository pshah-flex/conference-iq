// Company Intelligence repository

import { BaseRepository } from './base.repository';
import type { RepositoryResult } from './types';
import type { CompanyIntelligence } from '@/types';
import { ExhibitorsRepository } from './exhibitors.repository';
import { SpeakersRepository } from './speakers.repository';

export class CompanyIntelligenceRepository extends BaseRepository {
  private exhibitorsRepo = new ExhibitorsRepository();
  private speakersRepo = new SpeakersRepository();

  /**
   * Search for companies (from exhibitors and speakers)
   * Returns company names with exhibitor and speaker counts
   */
  async searchCompanies(query: string): Promise<RepositoryResult<Array<{ company_name: string; exhibitor_count: number; speaker_count: number }>>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      // Search in exhibitors
      const { data: exhibitors, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('company_name')
        .ilike('company_name', `%${query}%`)
        .limit(50);

      if (exhibitorError) {
        return { data: null, error: exhibitorError };
      }

      // Search in speakers
      const { data: speakers, error: speakerError } = await supabase
        .from('speakers')
        .select('company')
        .ilike('company', `%${query}%`)
        .not('company', 'is', null)
        .limit(50);

      if (speakerError) {
        return { data: null, error: speakerError };
      }

      // Combine and deduplicate, then get counts for each company
      const companies = new Set<string>();
      exhibitors?.forEach((e: { company_name?: string }) => {
        if (e.company_name) companies.add(e.company_name);
      });
      speakers?.forEach((s: { company?: string | null }) => {
        if (s.company) companies.add(s.company);
      });

      const companyList = Array.from(companies).sort();
      
      // Get counts for each company
      const results = await Promise.all(
        companyList.map(async (companyName) => {
          const [exhibitorResult, speakerResult] = await Promise.all([
            this.exhibitorsRepo.findByCompany(companyName),
            this.speakersRepo.findByCompany(companyName),
          ]);

          const exhibitorCount = exhibitorResult.data?.length || 0;
          const speakerCount = speakerResult.data?.length || 0;

          return {
            company_name: companyName,
            exhibitor_count: exhibitorCount,
            speaker_count: speakerCount,
          };
        })
      );

      return { data: results, error: null };
    });
  }

  /**
   * Get exhibitor history for a company
   */
  async getExhibitorHistory(companyName: string): Promise<RepositoryResult<CompanyIntelligence['exhibitor_history']>> {
    const exhibitorsResult = await this.exhibitorsRepo.findByCompany(companyName);
    
    if (exhibitorsResult.error) {
      return { data: null, error: exhibitorsResult.error };
    }

    const supabase = this.getSupabase();
    const exhibitors = exhibitorsResult.data;

    // Get conference names for each exhibitor
    const conferenceIds = [...new Set(exhibitors.map((e) => e.conference_id))];
    
    const { data: conferences, error } = await supabase
      .from('conferences')
      .select('id, name')
      .in('id', conferenceIds);

    if (error) {
      return { data: null, error };
    }

    const conferenceMap = new Map(conferences?.map((c: { id: string; name: string }) => [c.id, c.name]) || []);

    const history = exhibitors.map((exhibitor) => ({
      conference_id: exhibitor.conference_id,
      conference_name: conferenceMap.get(exhibitor.conference_id) || 'Unknown',
      tier: exhibitor.exhibitor_tier_normalized || null,
      cost: exhibitor.estimated_cost ? Number(exhibitor.estimated_cost) : null,
    }));

    return { data: history, error: null };
  }

  /**
   * Get speaker history for a company
   */
  async getSpeakerHistory(companyName: string): Promise<RepositoryResult<CompanyIntelligence['speaker_history']>> {
    const speakersResult = await this.speakersRepo.findByCompany(companyName);
    
    if (speakersResult.error) {
      return { data: null, error: speakersResult.error };
    }

    const supabase = this.getSupabase();
    const speakers = speakersResult.data;

    // Group by conference and count
    const conferenceMap = new Map<string, number>();
    speakers.forEach((speaker: { conference_id: string }) => {
      const count = conferenceMap.get(speaker.conference_id) || 0;
      conferenceMap.set(speaker.conference_id, count + 1);
    });

    // Get conference names
    const conferenceIds = Array.from(conferenceMap.keys());
    const { data: conferences, error } = await supabase
      .from('conferences')
      .select('id, name')
      .in('id', conferenceIds);

    if (error) {
      return { data: null, error };
    }

    const conferenceNameMap = new Map(conferences?.map((c: { id: string; name: string }) => [c.id, c.name]) || []);

    const history = Array.from(conferenceMap.entries()).map(([conferenceId, speakerCount]) => ({
      conference_id: conferenceId,
      conference_name: conferenceNameMap.get(conferenceId) || 'Unknown',
      speaker_count: speakerCount,
    }));

    return { data: history, error: null };
  }

  /**
   * Get estimated spend for a company (sum of explicit costs only, no estimates)
   */
  async getEstimatedSpend(companyName: string): Promise<RepositoryResult<number | null>> {
    const exhibitorsResult = await this.exhibitorsRepo.findByCompany(companyName);
    
    if (exhibitorsResult.error) {
      return { data: null, error: exhibitorsResult.error };
    }

    const exhibitors = exhibitorsResult.data;
    
    // Sum only explicit costs (where estimated_cost is not null)
    const total = exhibitors
      .filter((e) => e.estimated_cost !== null)
      .reduce((sum, e) => sum + Number(e.estimated_cost || 0), 0);

    return { data: total > 0 ? total : null, error: null };
  }

  /**
   * Get full company intelligence profile
   */
  async getFullProfile(companyName: string): Promise<RepositoryResult<CompanyIntelligence>> {
    const [exhibitorHistory, speakerHistory, estimatedSpend] = await Promise.all([
      this.getExhibitorHistory(companyName),
      this.getSpeakerHistory(companyName),
      this.getEstimatedSpend(companyName),
    ]);

    if (exhibitorHistory.error) {
      return { data: null, error: exhibitorHistory.error };
    }

    if (speakerHistory.error) {
      return { data: null, error: speakerHistory.error };
    }

    if (estimatedSpend.error) {
      return { data: null, error: estimatedSpend.error };
    }

    const profile: CompanyIntelligence = {
      company_name: companyName,
      exhibitor_history: exhibitorHistory.data || [],
      speaker_history: speakerHistory.data || [],
      total_spend: estimatedSpend.data,
    };

    return { data: profile, error: null };
  }
}

