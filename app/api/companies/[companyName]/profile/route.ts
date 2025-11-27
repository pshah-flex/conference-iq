// Company full intelligence profile endpoint

import { NextRequest, NextResponse } from 'next/server';
import { CompanyIntelligenceRepository } from '@/lib/repositories';

const companyRepo = new CompanyIntelligenceRepository();

// GET /api/companies/[companyName]/profile - Get full company intelligence profile
export async function GET(
  request: NextRequest,
  { params }: { params: { companyName: string } }
) {
  try {
    const decodedName = decodeURIComponent(params.companyName);
    const result = await companyRepo.getFullProfile(decodedName);

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

