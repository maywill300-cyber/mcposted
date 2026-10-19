import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import { Shield } from '@/components/icons';

export const metadata = { title: 'Sign in · McPosted' };

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/');

  return (
    <main className="page tight" style={{ minHeight: '100dvh', paddingTop: 64, gap: 24 }}>
      <h1 className="logo big" aria-label="McPosted">
        <span>Mc</span>
        <span className="tag">Posted</span>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>Stay posted.</p>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.45 }} className="muted">
          Anonymous posts from people at your school. Only verified students can join.
        </p>
      </div>
      <div style={{ flexGrow: 1 }} />
      <LoginForm />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }} className="small muted">
        <span style={{ color: 'var(--ink)', flexShrink: 0 }}>
          <Shield />
        </span>
        <p style={{ margin: 0 }}>
          Your email only proves you're a student. Other students never see it. It's only looked up if a post
          is a credible threat.
        </p>
      </div>
      <p className="hint" style={{ margin: 0, textAlign: 'center' }}>
        By joining you agree to the{' '}
        <Link href="/rules" style={{ fontWeight: 700 }}>
          Community Rules
        </Link>
        : no names, no threats, no bullying.
      </p>
    </main>
  );
}
