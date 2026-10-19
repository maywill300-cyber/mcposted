import Link from 'next/link';
import { requireViewer } from '@/lib/viewer';
import { CHANNELS, hotScore } from '@/lib/format';
import { todayEastern } from '@/lib/school';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import { Arrow } from '@/components/icons';

export const dynamic = 'force-dynamic';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(todayEastern() + 'T00:00:00Z');
  const target = new Date(dateStr + 'T00:00:00Z');
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target - today) / 86400000);
}

export default async function FeedPage({ searchParams }) {
  const params = await searchParams;
  const sort = params?.sort === 'new' ? 'new' : 'hot';
  const channel = CHANNELS.some((c) => c.id === params?.channel) ? params.channel : 'all';

  const { supabase, user } = await requireViewer();
  const since = new Date(Date.now() - 14 * 86400000).toISOString();

  let query = supabase
    .from('feed_posts')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(200);
  if (channel !== 'all') query = query.eq('channel', channel);

  const [{ data: postsRaw }, { data: teps }, { data: lunch }] = await Promise.all([
    query,
    supabase.from('settings').select('value').eq('key', 'teps_date').maybeSingle(),
    supabase.from('lunch_averages').select('*').eq('day', todayEastern()),
  ]);

  // Heavily downvoted posts drop out of the feed.
  let posts = (postsRaw || []).filter((p) => p.score > -5);
  if (sort === 'hot') posts = posts.sort((a, b) => hotScore(b) - hotScore(a));
  posts = posts.slice(0, 60);

  const pollIds = posts.filter((p) => p.is_poll).map((p) => p.id);
  const { data: pollRows } = pollIds.length
    ? await supabase.from('poll_results').select('*').in('post_id', pollIds).order('position')
    : { data: [] };
  const pollsByPost = {};
  for (const row of pollRows || []) (pollsByPost[row.post_id] ||= []).push(row);

  const tepsDays = daysUntil(teps?.value);
  const showTeps = tepsDays !== null && tepsDays >= 0 && tepsDays <= 30;
  const lunchFor = (l) => (lunch || []).find((r) => r.lunch === l);

  const href = (next) => {
    const p = new URLSearchParams();
    const s = next.sort ?? sort;
    const c = next.channel ?? channel;
    if (s !== 'hot') p.set('sort', s);
    if (c !== 'all') p.set('channel', c);
    const q = p.toString();
    return q ? '/?' + q : '/';
  };

  return (
    <>
      <header className="topbar">
        <Link href="/" className="logo" aria-label="McPosted home">
          <span>Mc</span>
          <span className="tag">Posted</span>
        </Link>
      </header>

      <nav className="sort-row" aria-label="Sort">
        <Link href={href({ sort: 'hot' })} className={sort === 'hot' ? 'on' : ''} aria-current={sort === 'hot' ? 'true' : undefined}>
          Hot
        </Link>
        <Link href={href({ sort: 'new' })} className={sort === 'new' ? 'on' : ''} aria-current={sort === 'new' ? 'true' : undefined}>
          New
        </Link>
      </nav>

      <nav className="channel-grid" aria-label="Channels">
        <Link href={href({ channel: 'all' })} className={channel === 'all' ? 'on' : ''}>All</Link>
        {CHANNELS.map((c) => (
          <Link key={c.id} href={href({ channel: c.id })} className={channel === c.id ? 'on' : ''}>
            {c.label}
          </Link>
        ))}
      </nav>

      <main className="page" style={{ paddingTop: 12 }}>
        {showTeps && channel === 'all' && (
          <section className="banner" aria-label="TEPS Day countdown">
            <div className="count">
              {tepsDays === 0 ? (
                <b style={{ fontSize: 22 }}>TODAY</b>
              ) : (
                <>
                  <b>{tepsDays}</b>
                  <small>{tepsDays === 1 ? 'day' : 'days'}</small>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="label">Countdown</span>
              <span className="title">TEPS Day</span>
              <span className="sub">Free dress day.</span>
            </div>
          </section>
        )}

        {channel === 'all' && (
          <Link href="/lunch" className="card card-link">
            <div className="meta">
              <span className="chip accent">Lunch Report</span>
              <span>Today</span>
              <span className="spacer" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink)', fontWeight: 800, fontSize: 15 }}>
                Rate it <Arrow size={18} />
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Today's averages</p>
            <div className="score-grid">
              {['1st', '2nd'].map((l) => {
                const row = lunchFor(l);
                return (
                  <div key={l} className={'score-box' + (l === '2nd' ? ' alt' : '')}>
                    <span className="k">{l} lunch</span>
                    <span className="v">
                      {row ? row.avg_score : '–'} <small>/10</small>
                    </span>
                    <span className="hint">
                      {row ? `${row.ratings} ${row.ratings === 1 ? 'rating' : 'ratings'}` : 'No ratings yet'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Link>
        )}

        {posts.length === 0 ? (
          <p className="empty">Nothing here yet. Be the first to post.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} userId={user.id} pollOptions={pollsByPost[post.id]} />
          ))
        )}
      </main>
      <BottomNav active="home" />
    </>
  );
}
