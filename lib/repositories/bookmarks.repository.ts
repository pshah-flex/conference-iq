// Bookmark repository

import { BaseRepository } from './base.repository';
import type { Bookmark, RepositoryResult } from './types';

export class BookmarksRepository extends BaseRepository {
  /**
   * Find all bookmarks for a user
   */
  async findByUserId(userId: string): Promise<RepositoryResult<Bookmark[]>> {
    const supabase = this.getSupabase();
    
    return this.executeQueryArray(async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    });
  }

  /**
   * Create a bookmark
   */
  async create(userId: string, conferenceId: string): Promise<RepositoryResult<Bookmark>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          conference_id: conferenceId,
        })
        .select()
        .single();
      
      return { data, error };
    });
  }

  /**
   * Delete a bookmark
   */
  async delete(userId: string, conferenceId: string): Promise<RepositoryResult<void>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('conference_id', conferenceId);
      
      if (error) {
        return { data: null, error };
      }
      
      return { data: undefined as any, error: null };
    });
  }

  /**
   * Check if a conference is bookmarked by a user
   */
  async isBookmarked(userId: string, conferenceId: string): Promise<RepositoryResult<boolean>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('conference_id', conferenceId)
        .maybeSingle();
      
      if (error) {
        return { data: null, error };
      }
      
      return { data: data !== null, error: null };
    });
  }
}

