import Link from 'next/link';
import { Clock } from '@/components/icons';

export const metadata = { title: 'Post held · McPosted' };

export default async function HeldPage({ searchParams }) {
  const params = await searchParams;
  const reason = typeof params?.reason === 'string' ? params.reason.slice(0, 200) : '';

  return (
    <>
      <header className="subbar" style={{ justifyContent: 'center' }}>
        <h1 style={{ flexGrow: 0 }}>Post held</h1>
      </header>
      <main className="page tight" style={{ gap: 24, paddingTop: 28 }}>
        <div
          aria-hidden="true"
          style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--accent)', border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0 var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Clock />
        </div>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>Your post is waiting for a moderator</h2>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: '#4a463d' }}>
          A student moderator will check it before it goes up. That usually takes a few hours.
        </p>
        {reason && (
          <div className="notice">
            <b>Why it was held:</b> {reason}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/new" className="btn">Write a new version</Link>
          <Link href="/" className="btn light">Back to feed</Link>
        </div>
        <p className="hint" style={{ margin: 0, textAlign: 'center' }}>
          Removing the detail that was flagged usually gets a post up right away.
        </p>
      </main>
    </>
  );
}
