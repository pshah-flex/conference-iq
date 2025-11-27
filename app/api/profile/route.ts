// Profile endpoints

import { NextRequest, NextResponse } from 'next/server';
import { ProfilesRepository } from '@/lib/repositories';
import { requireAuth } from '@/lib/utils/auth';
import { createServerSupabase } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const profilesRepo = new ProfilesRepository();
    // Set the authenticated Supabase client
    (profilesRepo as any).supabase = supabase;
    
    const result = await profilesRepo.findByUserId(user.id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const profilesRepo = new ProfilesRepository();
    // Set the authenticated Supabase client
    (profilesRepo as any).supabase = supabase;

    const body = await request.json();
    
    const schema = z.object({
      display_name: z.string().nullable().optional(),
      avatar_url: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      onboarding_completed: z.boolean().optional(),
      email_verified: z.boolean().optional(),
      preferences: z.record(z.any()).optional(),
    });

    const updateData = schema.parse(body);

    // Convert empty strings to null for nullable fields
    const cleanedData: any = {};
    if (updateData.display_name !== undefined) {
      cleanedData.display_name = updateData.display_name === '' ? null : updateData.display_name;
    }
    if (updateData.avatar_url !== undefined) {
      cleanedData.avatar_url = updateData.avatar_url === '' ? null : updateData.avatar_url;
    }
    if (updateData.bio !== undefined) {
      cleanedData.bio = updateData.bio === '' ? null : updateData.bio;
    }
    if (updateData.onboarding_completed !== undefined) {
      cleanedData.onboarding_completed = updateData.onboarding_completed;
    }
    if (updateData.email_verified !== undefined) {
      cleanedData.email_verified = updateData.email_verified;
    }
    if (updateData.preferences !== undefined) {
      cleanedData.preferences = updateData.preferences;
    }

    const result = await profilesRepo.update(user.id, cleanedData);

    if (result.error) {
      // Log the actual error for debugging
      console.error('Profile update error:', {
        error: result.error,
        userId: user.id,
        updateData: cleanedData,
      });

      return NextResponse.json(
        { error: result.error.message || 'Failed to update profile' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Profile API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

