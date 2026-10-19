import Link from 'next/link';
import VoteButtons from '@/components/VoteButtons';
import ReportMenu from '@/components/ReportMenu';
import PollBlock from '@/components/PollBlock';
import { Bubble } from '@/components/icons';
import { channelLabel, timeAgo } from '@/lib/format';

const CHIP_STYLE = {
  gossip: 'chip accent',
  polls: 'chip dark',
  mysteries: 'chip dashed',
};

export default function PostCard({ post, userId, pollOptions, linkToThread = true, large = false }) {
  return (
    <article className="card">
      <div className="meta">
        <span className={CHIP_STYLE[post.channel] || 'chip'}>{channelLabel(post.channel)}</span>
        <span>{timeAgo(post.created_at)}</span>
        {post.is_mine && <span>· yours</span>}
        <span className="spacer" />
        {!post.is_mine && <ReportMenu postId={post.id} userId={userId} />}
      </div>
      <p className="post-body" style={large ? { fontSize: 19, fontWeight: 600 } : undefined}>
        {post.body}
      </p>
      {post.is_poll && pollOptions?.length > 0 && (
        <PollBlock postId={post.id} userId={userId} options={pollOptions} />
      )}
      <div className="actions">
        <VoteButtons postId={post.id} userId={userId} initialScore={post.score} initialVote={post.my_vote} />
        {linkToThread && (
          <Link href={`/post/${post.id}`} className="reply-link">
            <Bubble />
            <span>
              {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
