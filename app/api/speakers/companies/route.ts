// Speaker company statistics endpoint

import { NextRequest, NextResponse } from 'next/server';
import { SpeakersRepository } from '@/lib/repositories';

const speakersRepo = new SpeakersRepository();

// GET /api/speakers/companies?conferenceId=... - Get company stats for a conference
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conferenceId = searchParams.get('conferenceId');

    if (!conferenceId) {
      return NextResponse.json(
        { error: 'Query parameter "conferenceId" is required' },
        { status: 400 }
      );
    }

    const result = await speakersRepo.getCompanyStats(conferenceId);

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

