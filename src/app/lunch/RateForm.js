'use client';

import { useActionState, useState } from 'react';
import { rateLunch } from './actions';
import { Check } from '@/components/icons';

const VERDICTS = { 1: 'Inedible', 2: 'Inedible', 3: 'Bad', 4: 'Bad', 5: 'Fine', 6: 'Fine', 7: 'Good', 8: 'Good', 9: 'Great', 10: 'Great' };

export default function RateForm({ lunch, alreadyRated, open, openLabel }) {
  const [state, action, pending] = useActionState(rateLunch, null);
  const [score, setScore] = useState(null);

  if (alreadyRated || state?.ok) {
    return (
      <div className="btn accent" role="status" style={{ cursor: 'default' }}>
        <Check />
        <span>Rating saved. You can rate again tomorrow.</span>
      </div>
    );
  }

  if (!open) {
    return <p className="notice" style={{ margin: 0 }}>Ratings open at {openLabel} on school days, after lunch is over.</p>;
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" name="score" value={score ?? ''} />
      <div className="rate-grid" role="group" aria-label="Score from 1 to 10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button key={n} type="button" aria-pressed={score === n} onClick={() => setScore(n)}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className="hint">
        <span>1 = inedible</span>
        <span>10 = actually good</span>
      </div>
      <div className="card flat" style={{ flexDirection: 'row', alignItems: 'center', padding: '12px 16px' }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 40, lineHeight: 1, minWidth: 44 }}>{score ?? '?'}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>{score ? VERDICTS[score] : 'Tap a number'}</span>
          <span className="hint">Rating {lunch} lunch</span>
        </div>
      </div>
      {state?.error && <p className="notice error" role="alert" style={{ margin: 0 }}>{state.error}</p>}
      <button type="submit" className="btn" disabled={!score || pending}>
        {pending ? 'Saving...' : 'Submit rating'}
      </button>
    </form>
  );
}
