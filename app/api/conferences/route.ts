// Conference list and create endpoints

import { NextRequest, NextResponse } from 'next/server';
import { ConferencesRepository } from '@/lib/repositories';
import { requireAdmin } from '@/lib/utils/auth';
import { z } from 'zod';

const conferencesRepo = new ConferencesRepository();

// GET /api/conferences - List conferences with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const industry = searchParams.get('industry')?.split(',') || undefined;
    const city = searchParams.get('city') || undefined;
    const country = searchParams.get('country') || undefined;
    const startDateFrom = searchParams.get('startDateFrom') 
      ? new Date(searchParams.get('startDateFrom')!) 
      : undefined;
    const startDateTo = searchParams.get('startDateTo')
      ? new Date(searchParams.get('startDateTo')!)
      : undefined;
    const searchQuery = searchParams.get('q') || undefined;
    
    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await conferencesRepo.findAll(
      {
        industry,
        city,
        country,
        startDateFrom,
        startDateTo,
        searchQuery,
      },
      { page, pageSize }
    );

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

// POST /api/conferences - Create new conference (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    
    // Validate required fields
    const schema = z.object({
      name: z.string().min(1),
      url: z.string().url(),
      start_date: z.string().optional().nullable(),
      end_date: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      industry: z.array(z.string()).optional().nullable(),
      attendance_estimate: z.number().optional().nullable(),
      agenda_url: z.string().url().optional().nullable(),
      pricing_url: z.string().url().optional().nullable(),
      organizer_name: z.string().optional().nullable(),
      organizer_email: z.string().email().optional().nullable(),
      organizer_phone: z.string().optional().nullable(),
    });

    const validated = schema.parse(body);

    const result = await conferencesRepo.create(validated);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
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

