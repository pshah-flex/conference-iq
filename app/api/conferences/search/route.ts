// Conference search endpoint

import { NextRequest, NextResponse } from 'next/server';
import { ConferencesRepository } from '@/lib/repositories';

const conferencesRepo = new ConferencesRepository();

// GET /api/conferences/search?q=... - Search conferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Parse optional filters
    const industry = searchParams.get('industry')?.split(',') || undefined;
    const city = searchParams.get('city') || undefined;
    const country = searchParams.get('country') || undefined;
    const startDateFrom = searchParams.get('startDateFrom')
      ? new Date(searchParams.get('startDateFrom')!)
      : undefined;
    const startDateTo = searchParams.get('startDateTo')
      ? new Date(searchParams.get('startDateTo')!)
      : undefined;

    const result = await conferencesRepo.search(query, {
      industry,
      city,
      country,
      startDateFrom,
      startDateTo,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

