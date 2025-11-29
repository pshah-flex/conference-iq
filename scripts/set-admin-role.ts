/**
 * Script to set admin role for a user
 * 
 * Usage: npx tsx scripts/set-admin-role.ts param@flexscale.com
 * 
 * Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env.local file
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setAdminRole(email: string) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variables. Please check your .env.local file.');
    }

    console.log(`🔐 Setting admin role for user: ${email}...`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // First, find the user by email
    const { data: users, error: findError } = await supabase.auth.admin.listUsers();
    
    if (findError) {
      throw new Error(`Failed to list users: ${findError.message}`);
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    console.log(`   ✅ Found user: ${user.id}`);

    // Get current metadata
    const currentMetadata = user.user_metadata || {};
    
    // Update metadata to include admin role
    const updatedMetadata = {
      ...currentMetadata,
      role: 'admin',
    };

    // Update the user's metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: updatedMetadata,
      }
    );

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    console.log(`   ✅ Admin role set successfully!`);
    console.log(`   📧 Email: ${updatedUser.user.email}`);
    console.log(`   👤 User ID: ${updatedUser.user.id}`);
    console.log(`   🔑 Role: ${updatedUser.user.user_metadata?.role}`);
    console.log(`\n   ⚠️  Note: User must log out and log back in for changes to take effect.`);

  } catch (error: any) {
    console.error('❌ Error setting admin role:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Please provide an email address');
  console.error('   Usage: npx tsx scripts/set-admin-role.ts <email>');
  process.exit(1);
}

setAdminRole(email);

