'use client';

import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

export default function PollBlock({ postId, userId, options }) {
  const [rows, setRows] = useState(options);
  const voted = rows.some((o) => o.mine);
  const total = rows.reduce((sum, o) => sum + o.votes, 0);

  async function vote(optionId) {
    if (voted) return;
    const prev = rows;
    setRows(rows.map((o) => (o.option_id === optionId ? { ...o, votes: o.votes + 1, mine: true } : o)));
    const { error } = await getBrowserClient()
      .from('poll_votes')
      .insert({ post_id: postId, option_id: optionId, user_id: userId });
    if (error && error.code !== '23505') setRows(prev);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return (
          <button
            key={o.option_id}
            type="button"
            className={'poll-option' + (o.mine ? ' mine' : '')}
            onClick={() => vote(o.option_id)}
            disabled={voted}
            aria-pressed={o.mine}
          >
            {voted && <i className="bar" style={{ width: pct + '%' }} aria-hidden="true" />}
            <span>{o.label}</span>
            {voted && <span>{pct}%</span>}
          </button>
        );
      })}
      <span className="hint">
        {total} {total === 1 ? 'vote' : 'votes'}
        {voted ? '' : ' · tap to vote'}
      </span>
    </div>
  );
}
