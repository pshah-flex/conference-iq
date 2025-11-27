// Admin crawl logs endpoint

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { createAdminSupabase } from '@/lib/supabase';

// GET /api/admin/crawl-logs - Get crawl logs (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status') || undefined;

    const supabase = createAdminSupabase();

    let query = supabase
      .from('crawl_logs')
      .select('*')
      .order('crawled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('crawl_logs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      data: data || [],
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
      },
    });
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

