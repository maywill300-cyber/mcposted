import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireViewer } from '@/lib/viewer';
import { createAdminClient } from '@/lib/supabase/admin';
import { channelLabel, timeAgo } from '@/lib/format';
import { moderateItem, setTepsDate, setModerator, unlockAccount } from './actions';
import { Back, Alert } from '@/components/icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Moderator queue · McPosted' };

const STATUS_LABEL = {
  held: 'Held by the AI check',
  hidden: 'Hidden by reports',
  urgent: 'Possible threat or safety concern',
  escalated: 'Sent to admin',
};

function ItemCard({ item, kind, showAuthor }) {
  const urgent = item.status === 'urgent' || item.status === 'escalated';
  return (
    <article className="card" style={urgent ? { borderWidth: 2.5 } : undefined}>
      <div className="meta">
        <span className={'chip' + (urgent ? ' dark' : '')}>{kind === 'comment' ? 'Reply' : channelLabel(item.channel)}</span>
        <span>{timeAgo(item.created_at)}</span>
      </div>
      <p className="post-body" style={{ fontSize: 16 }}>{item.body}</p>
      <div className="notice">
        <b>{STATUS_LABEL[item.status]}</b>
        {item.flag_reason ? <><br />{item.flag_reason}</> : null}
      </div>
      {showAuthor && item.profiles?.email && (
        <p className="notice error" style={{ margin: 0 }}>
          <b>Written by:</b> {item.profiles.email}. Only report this to the school if it's a credible threat.
        </p>
      )}
      <form action={moderateItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={item.id} />
        {item.status === 'escalated' ? (
          <>
            <button type="submit" name="op" value="approve" className="btn light small">Not a threat, restore</button>
            <button type="submit" name="op" value="resolve" className="btn small">Handled, take down</button>
          </>
        ) : (
          <>
            <button type="submit" name="op" value="approve" className="btn light small">Approve</button>
            <button type="submit" name="op" value="remove" className="btn small">Remove</button>
            {urgent && (
              <button type="submit" name="op" value="escalate" className="btn small" style={{ gridColumn: 'span 2', background: '#ffd23f', color: 'var(--ink)' }}>
                Send to admin
              </button>
            )}
          </>
        )}
      </form>
    </article>
  );
}

export default async function ModPage() {
  const { isMod, isAdmin } = await requireViewer();
  if (!isMod) notFound();

  const admin = createAdminClient();
  const statuses = isAdmin ? ['held', 'hidden', 'urgent', 'escalated'] : ['held', 'hidden', 'urgent'];
  // Moderators never get author info. The admin only sees it on threat cases.
  const postFields = 'id, channel, body, status, flag_reason, created_at' + (isAdmin ? ', profiles(email)' : '');
  const commentFields = 'id, body, status, flag_reason, created_at' + (isAdmin ? ', profiles(email)' : '');

  const [{ data: posts }, { data: comments }, settingsRes, lockedRes, modsRes] = await Promise.all([
    admin.from('posts').select(postFields).in('status', statuses).order('created_at', { ascending: true }).limit(100),
    admin.from('comments').select(commentFields).in('status', statuses).order('created_at', { ascending: true }).limit(100),
    isAdmin ? admin.from('settings').select('value').eq('key', 'teps_date').maybeSingle() : Promise.resolve({ data: null }),
    isAdmin ? admin.from('profiles').select('id, email, strikes').eq('locked', true).limit(50) : Promise.resolve({ data: [] }),
    isAdmin ? admin.from('profiles').select('email').eq('role', 'mod').limit(50) : Promise.resolve({ data: [] }),
  ]);

  const items = [
    ...(posts || []).map((p) => ({ item: p, kind: 'post' })),
    ...(comments || []).map((c) => ({ item: c, kind: 'comment' })),
  ];
  const rank = { escalated: 0, urgent: 1, held: 2, hidden: 3 };
  items.sort((a, b) => rank[a.item.status] - rank[b.item.status]);
  const urgentCount = items.filter((i) => i.item.status === 'urgent' || i.item.status === 'escalated').length;

  return (
    <>
      <header className="subbar">
        <Link href="/me" className="icon-btn" aria-label="Back">
          <Back />
        </Link>
        <h1>Mod queue</h1>
        <span className="hint" style={{ paddingRight: 8, fontWeight: 700 }}>{isAdmin ? 'Admin' : 'Moderator'}</span>
      </header>
      <main className="page tight">
        {urgentCount > 0 && (
          <section className="banner" style={{ boxShadow: 'none', alignItems: 'flex-start' }}>
            <span style={{ color: '#ffd23f', flexShrink: 0 }}><Alert /></span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontWeight: 800 }}>{urgentCount} possible safety {urgentCount === 1 ? 'issue' : 'issues'}</span>
              <span className="sub">
                If a post looks like a credible threat, send it to the admin. The Blue Book requires credible threats to be reported to the school.
              </span>
            </div>
          </section>
        )}

        {items.length === 0 ? (
          <p className="empty">Nothing waiting. Nice.</p>
        ) : (
          items.map(({ item, kind }) => (
            <ItemCard key={kind + item.id} item={item} kind={kind} showAuthor={isAdmin && (item.status === 'urgent' || item.status === 'escalated')} />
          ))
        )}

        <p className="hint" style={{ margin: 0 }}>
          Moderators never see who wrote a post. Three removals lock an account until an admin unlocks it.
        </p>

        {isAdmin && (
          <>
            <section className="card flat">
              <h2 className="section">TEPS Day</h2>
              <form action={setTepsDate} className="field">
                <label htmlFor="teps_date">Date (leave empty to hide the countdown)</label>
                <input id="teps_date" name="teps_date" type="date" className="input" defaultValue={settingsRes.data?.value || ''} />
                <button type="submit" className="btn small">Save date</button>
              </form>
            </section>

            <section className="card flat">
              <h2 className="section">Moderators</h2>
              <p className="hint" style={{ margin: 0 }}>
                {modsRes.data?.length ? modsRes.data.map((m) => m.email).join(', ') : 'No moderators yet.'}
              </p>
              <form action={setModerator} className="field">
                <label htmlFor="mod_email">Student's school email (they must have signed up)</label>
                <input id="mod_email" name="email" type="email" className="input" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                  <button type="submit" name="role" value="mod" className="btn small">Make moderator</button>
                  <button type="submit" name="role" value="student" className="btn light small">Remove moderator</button>
                </div>
              </form>
            </section>

            {lockedRes.data?.length > 0 && (
              <section className="card flat">
                <h2 className="section">Locked accounts</h2>
                {lockedRes.data.map((p) => (
                  <form key={p.id} action={unlockAccount} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="hidden" name="id" value={p.id} />
                    <span className="small" style={{ flexGrow: 1, overflowWrap: 'anywhere' }}>{p.email} · {p.strikes} strikes</span>
                    <button type="submit" className="pill">Unlock</button>
                  </form>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
