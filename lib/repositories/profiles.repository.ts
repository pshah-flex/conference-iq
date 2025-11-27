// Profile repository

import { BaseRepository } from './base.repository';
import type { RepositoryResult } from './types';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  onboarding_completed?: boolean;
  email_verified?: boolean;
  preferences?: Record<string, any>;
}

export interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  onboarding_completed?: boolean;
  email_verified?: boolean;
  last_login_at?: string;
  preferences?: Record<string, any>;
}

export class ProfilesRepository extends BaseRepository {
  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string): Promise<RepositoryResult<Profile>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { data, error };
    });
  }

  /**
   * Create a profile (usually called automatically by trigger, but can be called manually)
   */
  async create(userId: string, data: CreateProfileData = {}): Promise<RepositoryResult<Profile>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data: result, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: data.display_name || null,
          avatar_url: data.avatar_url || null,
          bio: data.bio || null,
          onboarding_completed: data.onboarding_completed || false,
          email_verified: data.email_verified || false,
          preferences: data.preferences || {},
        })
        .select()
        .single();
      
      return { data: result, error };
    });
  }

  /**
   * Update a profile
   */
  async update(userId: string, data: UpdateProfileData): Promise<RepositoryResult<Profile>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      const { data: result, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();
      
      return { data: result, error };
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<RepositoryResult<Profile>> {
    return this.update(userId, {
      last_login_at: new Date().toISOString(),
    });
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(userId: string): Promise<RepositoryResult<Profile>> {
    return this.update(userId, {
      onboarding_completed: true,
    });
  }

  /**
   * Update email verification status
   */
  async updateEmailVerified(userId: string, verified: boolean): Promise<RepositoryResult<Profile>> {
    return this.update(userId, {
      email_verified: verified,
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Record<string, any>): Promise<RepositoryResult<Profile>> {
    const supabase = this.getSupabase();
    
    return this.executeQuery(async () => {
      // Get current preferences and merge
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single();

      const mergedPreferences = {
        ...(currentProfile?.preferences || {}),
        ...preferences,
      };

      const { data: result, error } = await supabase
        .from('profiles')
        .update({ preferences: mergedPreferences })
        .eq('id', userId)
        .select()
        .single();
      
      return { data: result, error };
    });
  }
}

