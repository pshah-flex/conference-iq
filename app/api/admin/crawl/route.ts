// Admin crawl trigger endpoint

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { z } from 'zod';

// POST /api/admin/crawl - Trigger crawl for URL (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    
    const schema = z.object({
      url: z.string().url(),
    });

    const { url } = schema.parse(body);

    // TODO: This will be implemented in Phase 4 (Web Crawling Agent)
    // For now, return a placeholder response
    return NextResponse.json(
      { 
        message: 'Crawl triggered',
        url,
        note: 'Crawler implementation coming in Phase 4'
      },
      { status: 202 } // Accepted (async operation)
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
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

