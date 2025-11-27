// Conference speakers endpoint

import { NextRequest, NextResponse } from 'next/server';
import { SpeakersRepository } from '@/lib/repositories';

const speakersRepo = new SpeakersRepository();

// GET /api/conferences/[id]/speakers - Get speakers for a conference
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await speakersRepo.findByConferenceId(params.id);

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

