// Check if conference is bookmarked by current user

import { NextRequest, NextResponse } from 'next/server';
import { BookmarksRepository } from '@/lib/repositories';
import { requireAuth } from '@/lib/utils/auth';
import { createServerSupabase } from '@/lib/supabase';

// GET /api/bookmarks/[conferenceId]/check - Check if conference is bookmarked
export async function GET(
  request: NextRequest,
  { params }: { params: { conferenceId: string } }
) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const bookmarksRepo = new BookmarksRepository();
    // Set the authenticated Supabase client
    (bookmarksRepo as any).supabase = supabase;
    const result = await bookmarksRepo.isBookmarked(user.id, params.conferenceId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ isBookmarked: result.data || false });
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

