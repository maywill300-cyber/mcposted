import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireViewer, postingBlockedReason } from '@/lib/viewer';
import { channelLabel, timeAgo } from '@/lib/format';
import PostCard from '@/components/PostCard';
import ReportMenu from '@/components/ReportMenu';
import ReplyForm from './ReplyForm';
import { Back } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function ThreadPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const viewer = await requireViewer();
  const { supabase, user } = viewer;

  const [{ data: post }, { data: comments }, { data: pollRows }] = await Promise.all([
    supabase.from('feed_posts').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('thread_comments')
      .select('*')
      .eq('post_id', id)
      .in('status', ['live', 'hidden'])
      .order('created_at', { ascending: true }),
    supabase.from('poll_results').select('*').eq('post_id', id).order('position'),
  ]);
  if (!post) notFound();

  const replies = comments || [];

  return (
    <>
      <header className="subbar">
        <Link href="/" className="icon-btn" aria-label="Back to feed">
          <Back />
        </Link>
        <h1>{channelLabel(post.channel)}</h1>
      </header>

      <main className="page" style={{ paddingBottom: 24 }}>
        <PostCard post={post} userId={user.id} pollOptions={pollRows} linkToThread={false} large />

        <h2 className="section" style={{ paddingTop: 4 }}>
          {replies.filter((r) => r.status === 'live').length} replies
        </h2>

        <div>
          {replies.length === 0 && <p className="empty" style={{ padding: 20 }}>No replies yet.</p>}
          {replies.map((r) =>
            r.status === 'hidden' ? (
              <div key={r.id} className="hidden-note" style={{ margin: '8px 0' }}>
                This reply was hidden after several reports. A moderator will review it.
              </div>
            ) : (
              <div key={r.id} className="reply">
                <span className={'who' + (r.is_op ? ' op' : '')}>
                  {r.is_op ? 'OP' : `Anon ${r.anon_number}`}
                  {r.is_mine ? ' (you)' : ''}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexGrow: 1, minWidth: 0 }}>
                  <p>{r.body}</p>
                  <span className="hint">{timeAgo(r.created_at)}</span>
                </div>
                {!r.is_mine && <ReportMenu commentId={r.id} userId={user.id} />}
              </div>
            )
          )}
        </div>
      </main>

      <ReplyForm postId={post.id} disabledReason={postingBlockedReason(viewer)} />
    </>
  );
}
