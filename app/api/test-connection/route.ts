import { createServerSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    
    // Test 1: Basic connection - try to query a non-existent table
    // If we get a "table not found" error, it means connection works!
    const { error: tableError } = await supabase.from('_connection_test').select('*').limit(0);
    
    // PGRST116 = table not found (but connection works)
    // Any other error might indicate connection issues
    const connectionWorks = tableError?.code === 'PGRST116' || 
                           tableError?.message?.includes('schema cache') ||
                           tableError?.message?.includes('Could not find the table');
    
    if (!connectionWorks && tableError) {
      return NextResponse.json(
        { 
          success: false, 
          error: tableError.message,
          connection: 'failed',
          errorCode: tableError.code
        },
        { status: 500 }
      );
    }
    
    // Test 2: Auth service
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      return NextResponse.json(
        {
          success: false,
          error: `Connection works but auth failed: ${authError.message}`,
          connection: 'partial',
        },
        { status: 500 }
      );
    }
    
    // All tests passed!
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      connection: 'active',
      database: 'connected',
      auth: 'working',
      hasSession: !!session?.session,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        connection: 'failed',
        type: 'exception'
      },
      { status: 500 }
    );
  }
}

