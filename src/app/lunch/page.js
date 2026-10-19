import Link from 'next/link';
import { requireViewer } from '@/lib/viewer';
import { todayEastern, mondayEastern, lunchRatingsOpen, lunchOpenTime } from '@/lib/school';
import BottomNav from '@/components/BottomNav';
import RateForm from './RateForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lunch Report · McPosted' };

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function LunchPage() {
  const { supabase, user, profile } = await requireViewer();
  const today = todayEastern();
  const monday = mondayEastern();
  const friday = addDays(monday, 4);

  const [{ data: mine }, { data: week }] = await Promise.all([
    supabase.from('lunch_ratings').select('score').eq('user_id', user.id).eq('day', today).maybeSingle(),
    supabase.from('lunch_averages').select('*').gte('day', monday).lte('day', friday),
  ]);

  const rows = week || [];
  const find = (day, lunch) => rows.find((r) => r.day === day && r.lunch === lunch);
  const todayRows = ['1st', '2nd'].map((l) => ({ lunch: l, row: find(today, l) }));
  const weekDays = DAY_NAMES.map((name, i) => {
    const day = addDays(monday, i);
    return { name, day, a: find(day, '1st'), b: find(day, '2nd') };
  }).filter((d) => d.day <= today);

  return (
    <>
      <header className="subbar">
        <h1 style={{ paddingLeft: 8 }}>Lunch Report</h1>
      </header>
      <main className="page" style={{ gap: 24 }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className="big-title">Rate today's lunch</h2>
          <p className="hint" style={{ margin: 0 }}>
            You're rating <b>{profile.lunch_period} lunch</b>. <Link href="/me">Change</Link>
          </p>
          <RateForm
            lunch={profile.lunch_period}
            alreadyRated={!!mine}
            open={lunchRatingsOpen()}
            openLabel={lunchOpenTime().label}
          />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="section">Today's averages</h2>
          <div className="score-grid">
            {todayRows.map(({ lunch, row }) => (
              <div key={lunch} className={'score-box' + (lunch === '2nd' ? ' alt' : '')} style={{ boxShadow: '4px 4px 0 var(--ink)' }}>
                <span className="k">{lunch} lunch</span>
                <span className="v">
                  {row ? row.avg_score : '–'} <small>/10</small>
                </span>
                <span className="hint">{row ? `${row.ratings} ${row.ratings === 1 ? 'rating' : 'ratings'}` : 'No ratings yet'}</span>
              </div>
            ))}
          </div>
        </section>

        {weekDays.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="section">This week</h2>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--ink)' }} />1st
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)', border: '1px solid var(--ink)' }} />2nd
                </span>
              </div>
            </div>
            <div className="card flat" style={{ gap: 12 }}>
              {weekDays.map((d) => (
                <div key={d.day} className="week-row">
                  <span className="day">{d.name}</span>
                  <div className="week-bars">
                    <div className="week-bar">
                      <i style={{ width: `${(d.a?.avg_score || 0) * 8}%` }} aria-hidden="true" />
                      <span>{d.a ? d.a.avg_score : '–'}</span>
                    </div>
                    <div className="week-bar alt">
                      <i style={{ width: `${(d.b?.avg_score || 0) * 8}%` }} aria-hidden="true" />
                      <span>{d.b ? d.b.avg_score : '–'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <BottomNav active="lunch" />
    </>
  );
}
