// Authentication utilities

import { createServerSupabase } from '@/lib/supabase';

export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const role = user.user_metadata?.role;
  return role === 'admin';
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

