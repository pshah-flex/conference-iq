// Conference exhibitors endpoint

import { NextRequest, NextResponse } from 'next/server';
import { ExhibitorsRepository } from '@/lib/repositories';

const exhibitorsRepo = new ExhibitorsRepository();

// GET /api/conferences/[id]/exhibitors - Get exhibitors for a conference
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await exhibitorsRepo.findByConferenceId(params.id);

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

