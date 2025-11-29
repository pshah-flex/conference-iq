// Base repository class with common functionality

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RepositoryError, RepositoryResult } from './types';

// Get environment variables (lazy check to avoid build-time errors)
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  return key;
};

export abstract class BaseRepository {
  protected supabase?: any; // Use 'any' for flexibility with different Supabase client types
  
  constructor(supabaseClient?: any) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    }
  }
  
  protected getSupabase(): any {
    // If an authenticated client was set (e.g., from API route or constructor), use it
    if (this.supabase) {
      return this.supabase;
    }
    // Otherwise, create a direct Supabase client for repositories
    // RLS policies will handle security based on auth context
    return createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  protected handleError(error: unknown): RepositoryError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code,
        details: error,
      };
    }
    return {
      message: 'Unknown error occurred',
      details: error,
    };
  }

  protected success<T>(data: T): RepositoryResult<T> {
    return { data, error: null };
  }

  protected failure(error: RepositoryError): RepositoryResult<never> {
    return { data: null, error };
  }

  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<RepositoryResult<T>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        return this.failure(this.handleError(error));
      }
      
      if (data === null) {
        return this.failure({
          message: 'No data found',
        });
      }
      
      return this.success(data);
    } catch (error) {
      return this.failure(this.handleError(error));
    }
  }

  protected async executeQueryArray<T>(
    queryFn: () => Promise<{ data: T[] | null; error: any }>
  ): Promise<RepositoryResult<T[]>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        return this.failure(this.handleError(error));
      }
      
      return this.success(data || []);
    } catch (error) {
      return this.failure(this.handleError(error));
    }
  }
}

