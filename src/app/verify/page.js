import Link from 'next/link';
import { redirect } from 'next/navigation';
import VerifyForm from './VerifyForm';
import { Back } from '@/components/icons';

export const metadata = { title: 'Enter your code · McPosted' };

export default async function VerifyPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params?.email === 'string' ? params.email : '';
  if (!email) redirect('/login');

  return (
    <main className="page tight" style={{ minHeight: '100dvh', gap: 24 }}>
      <Link href="/login" className="icon-btn" aria-label="Back to sign in" style={{ marginLeft: -12 }}>
        <Back />
      </Link>
      <h1 className="big-title">Check your email</h1>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 1.45 }}>
        We sent a login code to <b style={{ overflowWrap: 'anywhere' }}>{email}</b>. It can take a minute, and school
        email sometimes puts it in spam or quarantine.
      </p>
      <VerifyForm email={email} />
      <p className="hint" style={{ margin: 0, textAlign: 'center' }}>
        No code? <Link href="/login">Send a new one</Link>
      </p>
    </main>
  );
}
