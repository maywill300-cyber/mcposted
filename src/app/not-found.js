import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page tight" style={{ minHeight: '60dvh', justifyContent: 'center', textAlign: 'center' }}>
      <h1 className="big-title">Not here</h1>
      <p className="muted" style={{ margin: 0 }}>This post was removed, or the link is wrong.</p>
      <Link href="/" className="btn light">Back to feed</Link>
    </main>
  );
}
