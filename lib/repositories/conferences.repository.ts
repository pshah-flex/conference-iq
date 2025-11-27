// Conference repository

import { BaseRepository } from './base.repository';
import type { PaginatedResult, ConferenceFilters, PaginationOptions, RepositoryResult } from './types';
import type { Conference } from '@/types';

export class ConferencesRepository extends BaseRepository {
  /**
   * Find all conferences with optional filters and pagination
   */
  async findAll(
    filters: ConferenceFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<RepositoryResult<PaginatedResult<Conference>>> {
    const { page = 1, pageSize = 20 } = pagination;
    const supabase = this.getSupabase();

    let query = supabase
      .from('conferences')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.industry && filters.industry.length > 0) {
      query = query.contains('industry', filters.industry);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.startDateFrom) {
      query = query.gte('start_date', filters.startDateFrom.toISOString().split('T')[0]);
    }

    if (filters.startDateTo) {
      query = query.lte('start_date', filters.startDateTo.toISOString().split('T')[0]);
    }

    if (filters.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%,country.ilike.%${filters.searchQuery}%`);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by start_date (upcoming first)
    query = query.order('start_date', { ascending: true, nullsFirst: false });

    return this.executeQuery(async () => {
      const { data, error, count } = await query;
      
      if (error) {
        return { data: null, error };
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: {
          data: (data || []) as Conference[],
          page,
          pageSize,
          total,
          totalPages,
        },
        error: null,
      };
    });
  }

  /**
   * Find conference by ID
   */
  async findById(id: string): Promise<RepositoryResult<Conference>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('conferences')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    });
  }

  /**
   * Find conference by URL
   */
  async findByUrl(url: string): Promise<RepositoryResult<Conference>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('conferences')
        .select('*')
        .eq('url', url)
        .single();
      
      return { data, error };
    });
  }

  /**
   * Create a new conference
   */
  async create(data: Partial<Omit<Conference, 'id' | 'created_at' | 'updated_at' | 'fields_populated_count' | 'total_fields_count' | 'last_crawled_at' | 'last_verified_at'>> & { name: string; url: string }): Promise<RepositoryResult<Conference>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data: result, error } = await supabase
        .from('conferences')
        .insert(data)
        .select()
        .single();
      
      return { data: result, error };
    });
  }

  /**
   * Update a conference
   */
  async update(id: string, data: Partial<Omit<Conference, 'id' | 'created_at'>>): Promise<RepositoryResult<Conference>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data: result, error } = await supabase
        .from('conferences')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      return { data: result, error };
    });
  }

  /**
   * Update completeness count (trigger will handle this automatically, but can be called manually)
   */
  async updateCompletenessCount(id: string): Promise<RepositoryResult<Conference>> {
    // The trigger automatically calculates this, but we can trigger an update
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      // Just update updated_at to trigger the completeness calculation
      const { data: result, error } = await supabase
        .from('conferences')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      return { data: result, error };
    });
  }

  /**
   * Search conferences
   */
  async search(query: string, filters: ConferenceFilters = {}): Promise<RepositoryResult<Conference[]>> {
    const supabase = this.getSupabase();

    let dbQuery = supabase
      .from('conferences')
      .select('*');

    // Apply search query
    dbQuery = dbQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`);

    // Apply additional filters
    if (filters.industry && filters.industry.length > 0) {
      dbQuery = dbQuery.contains('industry', filters.industry);
    }

    if (filters.city) {
      dbQuery = dbQuery.eq('city', filters.city);
    }

    if (filters.country) {
      dbQuery = dbQuery.eq('country', filters.country);
    }

    if (filters.startDateFrom) {
      dbQuery = dbQuery.gte('start_date', filters.startDateFrom.toISOString().split('T')[0]);
    }

    if (filters.startDateTo) {
      dbQuery = dbQuery.lte('start_date', filters.startDateTo.toISOString().split('T')[0]);
    }

    dbQuery = dbQuery.order('start_date', { ascending: true, nullsFirst: false });

    return this.executeQueryArray(async () => {
      const { data, error } = await dbQuery;
      return { data, error };
    });
  }
}

