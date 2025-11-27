// Bookmark list and create endpoints

import { NextRequest, NextResponse } from 'next/server';
import { BookmarksRepository } from '@/lib/repositories';
import { requireAuth } from '@/lib/utils/auth';
import { z } from 'zod';

const bookmarksRepo = new BookmarksRepository();

// GET /api/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
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

    const body = await request.json();
    
    const schema = z.object({
      conferenceId: z.string().uuid(),
    });

    const { conferenceId } = schema.parse(body);

    const result = await bookmarksRepo.create(user.id, conferenceId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: any) {
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

