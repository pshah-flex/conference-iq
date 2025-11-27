// Base repository class with common functionality

import { createClient } from '@supabase/supabase-js';
import type { RepositoryError, RepositoryResult } from './types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export abstract class BaseRepository {
  protected getSupabase() {
    // Create a direct Supabase client for repositories
    // RLS policies will handle security based on auth context
    return createClient(supabaseUrl, supabaseAnonKey);
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

