'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { requireViewer } from '@/lib/viewer';
import { createAdminClient } from '@/lib/supabase/admin';

const STRIKES_TO_LOCK = 3;

async function requireMod() {
  const viewer = await requireViewer();
  if (!viewer.isMod) notFound();
  return viewer;
}

function tableFor(kind) {
  return kind === 'comment' ? 'comments' : 'posts';
}

export async function moderateItem(formData) {
  const viewer = await requireMod();
  const kind = formData.get('kind') === 'comment' ? 'comment' : 'post';
  const id = String(formData.get('id') || '');
  const op = String(formData.get('op') || '');
  const table = tableFor(kind);
  const admin = createAdminClient();

  const { data: item } = await admin.from(table).select('id, author_id, status').eq('id', id).maybeSingle();
  if (!item) return;

  if (op === 'approve') {
    await admin.from(table).update({ status: 'live', flag_reason: null }).eq('id', id);
  } else if (op === 'remove') {
    await admin.from(table).update({ status: 'removed' }).eq('id', id);
    const { data: author } = await admin.from('profiles').select('strikes').eq('id', item.author_id).single();
    const strikes = (author?.strikes || 0) + 1;
    await admin
      .from('profiles')
      .update({ strikes, locked: strikes >= STRIKES_TO_LOCK })
      .eq('id', item.author_id);
  } else if (op === 'escalate') {
    await admin.from(table).update({ status: 'escalated' }).eq('id', id);
  } else if (op === 'resolve' && viewer.isAdmin) {
    // Admin has handled an escalated item (reported it to the school or cleared it).
    await admin.from(table).update({ status: 'removed' }).eq('id', id);
  }

  revalidatePath('/mod');
  revalidatePath('/');
}

export async function setTepsDate(formData) {
  const viewer = await requireMod();
  if (!viewer.isAdmin) notFound();
  const value = String(formData.get('teps_date') || '').trim();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  await createAdminClient().from('settings').upsert({ key: 'teps_date', value: valid });
  revalidatePath('/mod');
  revalidatePath('/');
}

export async function setModerator(formData) {
  const viewer = await requireMod();
  if (!viewer.isAdmin) notFound();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const role = formData.get('role') === 'mod' ? 'mod' : 'student';
  if (!email) return;
  await createAdminClient().from('profiles').update({ role }).eq('email', email).neq('role', 'admin');
  revalidatePath('/mod');
}

export async function unlockAccount(formData) {
  const viewer = await requireMod();
  if (!viewer.isAdmin) notFound();
  const id = String(formData.get('id') || '');
  await createAdminClient().from('profiles').update({ locked: false, strikes: 0 }).eq('id', id);
  revalidatePath('/mod');
}
