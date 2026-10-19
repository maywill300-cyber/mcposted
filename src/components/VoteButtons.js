'use client';

import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Up, Down } from '@/components/icons';

export default function VoteButtons({ postId, userId, initialScore, initialVote }) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(initialVote || 0);
  const [busy, setBusy] = useState(false);

  async function cast(value) {
    if (busy) return;
    const next = vote === value ? 0 : value;
    const prevVote = vote;
    const prevScore = score;
    setVote(next);
    setScore(score - prevVote + next);
    setBusy(true);
    const supabase = getBrowserClient();
    const { error } =
      next === 0
        ? await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', userId)
        : await supabase.from('votes').upsert({ post_id: postId, user_id: userId, value: next });
    if (error) {
      setVote(prevVote);
      setScore(prevScore);
    }
    setBusy(false);
  }

  return (
    <div className="vote">
      <button type="button" aria-label="Upvote" aria-pressed={vote === 1} onClick={() => cast(1)}>
        <Up />
      </button>
      <span className="count" aria-label={`Score ${score}`}>{score}</span>
      <button type="button" aria-label="Downvote" aria-pressed={vote === -1} onClick={() => cast(-1)}>
        <Down />
      </button>
    </div>
  );
}
