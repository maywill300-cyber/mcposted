'use server';

import { redirect } from 'next/navigation';
import { requireViewer, postingBlockedReason } from '@/lib/viewer';
import { createAdminClient } from '@/lib/supabase/admin';
import { moderate } from '@/lib/moderation';

const POST_CHANNELS = ['gossip', 'confessions', 'mysteries', 'events'];
const POSTS_PER_HOUR = 5;
const REPLIES_PER_HOUR = 30;

const SUPPORT_MESSAGE =
  "Your post wasn't published. If you're going through something, the Counseling Center is open-door, or you can call or text 988 any time.";

export async function createPost(prevState, formData) {
  const viewer = await requireViewer();
  const blocked = postingBlockedReason(viewer);
  if (blocked) return { error: blocked };

  const body = String(formData.get('body') || '').trim();
  let channel = String(formData.get('channel') || '');
  const isPoll = formData.get('poll') === 'on';
  const options = isPoll
    ? formData
        .getAll('option')
        .map((o) => String(o).trim())
        .filter(Boolean)
    : [];

  if (!body) return { error: 'Write something first.' };
  if (body.length > 280) return { error: 'Posts can be 280 characters at most.' };
  if (isPoll) {
    if (options.length < 2) return { error: 'A poll needs at least 2 options.' };
    if (options.some((o) => o.length > 60)) return { error: 'Poll options can be 60 characters at most.' };
    channel = 'polls';
  } else if (!POST_CHANNELS.includes(channel)) {
    return { error: 'Pick a channel.' };
  }

  const admin = createAdminClient();
  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await admin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', viewer.user.id)
    .gte('created_at', hourAgo);
  if ((count || 0) >= POSTS_PER_HOUR) {
    return { error: 'You can post 5 times an hour. Try again a little later.' };
  }

  const verdict = await moderate(isPoll ? `${body}\nPoll options: ${options.join(' | ')}` : body);
  if (verdict.action === 'block') return { error: verdict.reason, values: { body, channel } };

  const status = verdict.action === 'allow' ? 'live' : verdict.action === 'urgent' ? 'urgent' : 'held';
  const { data: post, error } = await admin
    .from('posts')
    .insert({
      author_id: viewer.user.id,
      channel,
      body,
      status,
      flag_reason: status === 'live' ? null : verdict.category ? `${verdict.category}: ${verdict.reason}` : verdict.reason,
    })
    .select('id')
    .single();
  if (error) {
    console.error(error);
    return { error: 'Something went wrong. Try again.' };
  }

  if (isPoll) {
    await admin
      .from('poll_options')
      .insert(options.slice(0, 4).map((label, i) => ({ post_id: post.id, label, position: i })));
  }

  if (status === 'urgent') return { support: SUPPORT_MESSAGE };
  if (status === 'held') redirect('/held?reason=' + encodeURIComponent(verdict.reason));
  redirect('/');
}

export async function createComment(prevState, formData) {
  const viewer = await requireViewer();
  const blocked = postingBlockedReason(viewer);
  if (blocked) return { error: blocked };

  const postId = String(formData.get('postId') || '');
  const body = String(formData.get('body') || '').trim();
  if (!body) return { error: 'Write a reply first.' };
  if (body.length > 280) return { error: 'Replies can be 280 characters at most.' };

  const admin = createAdminClient();
  const { data: post } = await admin.from('posts').select('id, status').eq('id', postId).maybeSingle();
  if (!post || post.status !== 'live') return { error: 'This post is no longer available.' };

  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await admin
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', viewer.user.id)
    .gte('created_at', hourAgo);
  if ((count || 0) >= REPLIES_PER_HOUR) {
    return { error: "You're replying a lot. Take a break and try again later." };
  }

  const verdict = await moderate(body);
  if (verdict.action === 'block') return { error: verdict.reason, value: body };

  const status = verdict.action === 'allow' ? 'live' : verdict.action === 'urgent' ? 'urgent' : 'held';
  const { error } = await admin.from('comments').insert({
    post_id: postId,
    author_id: viewer.user.id,
    body,
    status,
    flag_reason: status === 'live' ? null : verdict.category ? `${verdict.category}: ${verdict.reason}` : verdict.reason,
  });
  if (error) {
    console.error(error);
    return { error: 'Something went wrong. Try again.' };
  }

  if (status === 'urgent') return { support: SUPPORT_MESSAGE };
  if (status === 'held') return { held: 'Your reply is waiting for a moderator. ' + verdict.reason, ok: Date.now() };
  return { ok: Date.now() };
}
