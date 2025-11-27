// Bookmark delete endpoint

import { NextRequest, NextResponse } from 'next/server';
import { BookmarksRepository } from '@/lib/repositories';
import { requireAuth } from '@/lib/utils/auth';
import { createServerSupabase } from '@/lib/supabase';

// DELETE /api/bookmarks/[conferenceId] - Remove bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { conferenceId: string } }
) {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();
    const bookmarksRepo = new BookmarksRepository();
    // Set the authenticated Supabase client
    (bookmarksRepo as any).supabase = supabase;

    const result = await bookmarksRepo.delete(user.id, params.conferenceId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
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

