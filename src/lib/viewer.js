import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isGraduated } from '@/lib/school';

// The signed-in student and their profile. Sends them to login or setup if needed.
export async function requireViewer({ allowNoLunch = false } = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, grad_year, lunch_period, role, strikes, locked')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (!allowNoLunch && !profile.lunch_period) redirect('/welcome');

  return {
    supabase,
    user,
    profile,
    graduated: isGraduated(profile.grad_year),
    isMod: profile.role === 'mod' || profile.role === 'admin',
    isAdmin: profile.role === 'admin',
  };
}

// Reasons a student can't post right now, or null.
export function postingBlockedReason(viewer) {
  if (viewer.profile.locked) {
    return 'Your account is locked after repeated rule breaks. An admin will review it.';
  }
  if (viewer.graduated) {
    return 'Your class has graduated, so your account is read-only now.';
  }
  return null;
}
