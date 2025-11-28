// Admin crawl trigger endpoint

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { CrawlerService } from '@/lib/services/crawler-service';
import { z } from 'zod';

// POST /api/admin/crawl - Trigger crawl for URL (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    
    const schema = z.object({
      url: z.string().url().optional(),
      conferenceId: z.string().uuid().optional(),
      saveHtmlToStorage: z.boolean().optional().default(false),
      savePdfToStorage: z.boolean().optional().default(false),
      overwriteExisting: z.boolean().optional().default(false),
    }).refine(data => data.url || data.conferenceId, {
      message: 'Either url or conferenceId must be provided',
    });

    const { url, conferenceId, saveHtmlToStorage, savePdfToStorage, overwriteExisting } = schema.parse(body);

    const crawlerService = new CrawlerService();
    let result;

    if (conferenceId) {
      result = await crawlerService.crawlById(conferenceId, {
        saveHtmlToStorage,
        savePdfToStorage,
        overwriteExisting,
      });
    } else if (url) {
      result = await crawlerService.crawlByUrl(url, {
        saveHtmlToStorage,
        savePdfToStorage,
        overwriteExisting,
      });
    } else {
      return NextResponse.json(
        { error: 'Either url or conferenceId must be provided' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.message,
          details: result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: result.message,
        result,
      },
      { status: result.status === 'success' ? 200 : 202 } // 200 for success, 202 for partial
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

