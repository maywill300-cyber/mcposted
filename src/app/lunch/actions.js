'use server';

import { revalidatePath } from 'next/cache';
import { requireViewer } from '@/lib/viewer';
import { createAdminClient } from '@/lib/supabase/admin';
import { lunchRatingsOpen, lunchOpenTime, todayEastern } from '@/lib/school';

export async function rateLunch(prevState, formData) {
  const viewer = await requireViewer();
  if (viewer.profile.locked) return { error: 'Your account is locked.' };

  const score = Number(formData.get('score'));
  if (!Number.isInteger(score) || score < 1 || score > 10) return { error: 'Pick a number from 1 to 10.' };
  if (!lunchRatingsOpen()) {
    return { error: `Ratings open at ${lunchOpenTime().label} on school days.` };
  }

  const admin = createAdminClient();
  const { error } = await admin.from('lunch_ratings').insert({
    user_id: viewer.user.id,
    day: todayEastern(),
    lunch: viewer.profile.lunch_period,
    score,
  });
  if (error) {
    if (error.code === '23505') return { error: "You've already rated today's lunch." };
    console.error(error);
    return { error: 'Something went wrong. Try again.' };
  }

  revalidatePath('/lunch');
  revalidatePath('/');
  return { ok: true };
}
