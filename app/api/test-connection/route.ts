import { createServerSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('_test')
      .select('*')
      .limit(1);
    
    // This will fail (table doesn't exist), but confirms connection works
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          connection: 'failed'
        },
        { status: 500 }
      );
    }
    
    // Test auth service
    const { data: session } = await supabase.auth.getSession();
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      connection: 'active',
      hasSession: !!session,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        connection: 'failed',
      },
      { status: 500 }
    );
  }
}

