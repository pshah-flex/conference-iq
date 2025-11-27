// Check if conference is bookmarked by current user

import { NextRequest, NextResponse } from 'next/server';
import { BookmarksRepository } from '@/lib/repositories';
import { requireAuth } from '@/lib/utils/auth';

const bookmarksRepo = new BookmarksRepository();

// GET /api/bookmarks/[conferenceId]/check - Check if conference is bookmarked
export async function GET(
  request: NextRequest,
  { params }: { params: { conferenceId: string } }
) {
  try {
    const user = await requireAuth();
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

