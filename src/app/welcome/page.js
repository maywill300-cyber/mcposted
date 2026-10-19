import { redirect } from 'next/navigation';
import { requireViewer } from '@/lib/viewer';
import { classLabel } from '@/lib/school';

export const metadata = { title: 'Welcome · McPosted' };

async function saveLunch(formData) {
  'use server';
  const lunch = formData.get('lunch');
  if (lunch !== '1st' && lunch !== '2nd') return;
  const { supabase, user } = await requireViewer({ allowNoLunch: true });
  await supabase.from('profiles').update({ lunch_period: lunch }).eq('id', user.id);
  redirect('/');
}

export default async function WelcomePage() {
  const { profile } = await requireViewer({ allowNoLunch: true });
  if (profile.lunch_period) redirect('/');

  return (
    <main className="page tight" style={{ minHeight: '100dvh', gap: 24, paddingTop: 48 }}>
      <p className="chip accent" style={{ alignSelf: 'flex-start', margin: 0 }}>
        {classLabel(profile.grad_year)}
      </p>
      <h1 className="big-title">You're in</h1>
      <section className="card flat">
        <h2 className="section">The rules</h2>
        <ul className="rule-list">
          <li><b>No names, ever.</b> No full names, initials, or nicknames.</li>
          <li>No posts that point at one specific person.</li>
          <li>No threats, bullying, slurs, or anyone's private info.</li>
          <li>Text only. No photos or screenshots.</li>
        </ul>
      </section>
      <form action={saveLunch} className="field" style={{ gap: 12 }}>
        <span className="label">Which lunch do you have?</span>
        <p className="hint" style={{ margin: 0 }}>Used for lunch ratings. You can change it later.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <button type="submit" name="lunch" value="1st" className="btn light">1st lunch</button>
          <button type="submit" name="lunch" value="2nd" className="btn light">2nd lunch</button>
        </div>
      </form>
    </main>
  );
}
