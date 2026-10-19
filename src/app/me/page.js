import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { requireViewer } from '@/lib/viewer';
import { classLabel } from '@/lib/school';
import { signOut } from '../login/actions';
import BottomNav from '@/components/BottomNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Me · McPosted' };

async function changeLunch(formData) {
  'use server';
  const lunch = formData.get('lunch');
  if (lunch !== '1st' && lunch !== '2nd') return;
  const { supabase, user } = await requireViewer();
  await supabase.from('profiles').update({ lunch_period: lunch }).eq('id', user.id);
  revalidatePath('/me');
}

export default async function MePage() {
  const { profile, isMod, graduated } = await requireViewer();

  return (
    <>
      <header className="subbar">
        <h1 style={{ paddingLeft: 8 }}>Me</h1>
      </header>
      <main className="page" style={{ gap: 20 }}>
        <section className="card">
          <div className="meta">
            <span className="chip accent">{classLabel(profile.grad_year)}</span>
            {profile.role !== 'student' && <span className="chip dark">{profile.role === 'admin' ? 'Admin' : 'Moderator'}</span>}
          </div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.45 }}>
            You post anonymously. Other students never see your email or which posts are yours.
          </p>
          {graduated && <p className="notice" style={{ margin: 0 }}>Your class has graduated, so your account is read-only.</p>}
          {profile.locked && <p className="notice error" style={{ margin: 0 }}>Your account is locked after repeated rule breaks.</p>}
        </section>

        <form action={changeLunch} className="field" style={{ gap: 10 }}>
          <span className="label">Your lunch</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {['1st', '2nd'].map((l) => (
              <button
                key={l}
                type="submit"
                name="lunch"
                value={l}
                className="btn small"
                aria-pressed={profile.lunch_period === l}
                style={profile.lunch_period === l ? undefined : { background: 'var(--card)', color: 'var(--ink)', border: '1.5px solid var(--ink)' }}
              >
                {l} lunch
              </button>
            ))}
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isMod && <Link href="/mod" className="btn">Moderator queue</Link>}
          <Link href="/rules" className="btn light">Community rules</Link>
          <form action={signOut}>
            <button type="submit" className="btn light">Sign out</button>
          </form>
        </div>
      </main>
      <BottomNav active="me" />
    </>
  );
}
