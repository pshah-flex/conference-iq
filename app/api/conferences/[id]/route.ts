// Conference detail, update, and delete endpoints

import { NextRequest, NextResponse } from 'next/server';
import { ConferencesRepository } from '@/lib/repositories';
import { requireAdmin } from '@/lib/utils/auth';
import { z } from 'zod';

const conferencesRepo = new ConferencesRepository();

// GET /api/conferences/[id] - Get conference by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await conferencesRepo.findById(params.id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 404 }
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

// PATCH /api/conferences/[id] - Update conference (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    
    // Validate update fields
    const schema = z.object({
      name: z.string().min(1).optional(),
      url: z.string().url().optional(),
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

    const result = await conferencesRepo.update(params.id, validated);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
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

// DELETE /api/conferences/[id] - Delete conference (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Note: We'll need to add a delete method to the repository
    // For now, we can use the Supabase client directly
    const { createAdminSupabase } = await import('@/lib/supabase');
    const supabase = createAdminSupabase();
    
    const { error } = await supabase
      .from('conferences')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

