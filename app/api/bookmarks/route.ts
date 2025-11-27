// Bookmark list and create endpoints

import { NextRequest, NextResponse } from 'next/server';
import { BookmarksRepository } from '@/lib/repositories';
import { requireAuth } from '@/lib/utils/auth';
import { createServerSupabase } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const bookmarksRepo = new BookmarksRepository();
    // Set the authenticated Supabase client
    (bookmarksRepo as any).supabase = supabase;
    const result = await bookmarksRepo.findByUserId(user.id);

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

// POST /api/bookmarks - Create bookmark
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const bookmarksRepo = new BookmarksRepository();
    // Set the authenticated Supabase client
    (bookmarksRepo as any).supabase = supabase;

    const body = await request.json();
    
    const schema = z.object({
      conferenceId: z.string().uuid(),
    });

    const { conferenceId } = schema.parse(body);

    const result = await bookmarksRepo.create(user.id, conferenceId);

    if (result.error) {
      // Check for duplicate bookmark error (PostgreSQL unique constraint violation)
      const errorMessage = result.error.message || 'Unknown error';
      const errorCode = result.error.code || '';
      
      // Check for duplicate/unique constraint violations
      const isDuplicate = errorMessage.toLowerCase().includes('duplicate') || 
                         errorMessage.toLowerCase().includes('unique') ||
                         errorMessage.toLowerCase().includes('already exists') ||
                         errorCode === '23505'; // PostgreSQL unique violation code
      
      if (isDuplicate) {
        return NextResponse.json(
          { error: 'This conference is already bookmarked' },
          { status: 409 } // Conflict status code
        );
      }

      // Log the actual error for debugging
      console.error('Bookmark creation error:', {
        error: result.error,
        userId: user.id,
        conferenceId,
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
    console.error('Bookmark API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid conference ID format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

