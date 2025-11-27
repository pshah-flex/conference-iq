/**
 * Test script to verify Supabase connection
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('🔌 Testing Supabase connection...\n');

// Test with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    // This will likely fail (table doesn't exist), but it confirms we can connect
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful\n');

    // Test 2: Auth connection
    console.log('Test 2: Testing auth service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth test failed:', authError.message);
      return false;
    }
    
    console.log('✅ Auth service accessible\n');

    // Test 3: Service role key (if provided)
    if (supabaseServiceKey) {
      console.log('Test 3: Testing service role key...');
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      const { data: adminData, error: adminError } = await adminSupabase.auth.admin.listUsers();
      
      if (adminError) {
        console.error('❌ Service role key test failed:', adminError.message);
        return false;
      }
      
      console.log('✅ Service role key working\n');
    } else {
      console.log('⚠️  Service role key not provided (skipping admin test)\n');
    }

    console.log('🎉 All connection tests passed!');
    console.log('\nSupabase is ready for Phase 1: Database Schema & Migrations');
    return true;
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});

