// Company speaker history endpoint

import { NextRequest, NextResponse } from 'next/server';
import { CompanyIntelligenceRepository } from '@/lib/repositories';

const companyRepo = new CompanyIntelligenceRepository();

// GET /api/companies/[companyName]/speakers - Get speaker history for a company
export async function GET(
  request: NextRequest,
  { params }: { params: { companyName: string } }
) {
  try {
    const decodedName = decodeURIComponent(params.companyName);
    const result = await companyRepo.getSpeakerHistory(decodedName);

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

