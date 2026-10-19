'use client';

import { useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Dots } from '@/components/icons';

const REASONS = [
  { id: 'names', label: 'Names or points at someone' },
  { id: 'bullying', label: 'Bullying or mean' },
  { id: 'threat', label: 'Threat or someone in danger' },
  { id: 'spam', label: 'Spam' },
  { id: 'other', label: 'Something else' },
];

export default function ReportMenu({ postId, commentId, userId }) {
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  async function report(reason) {
    const supabase = getBrowserClient();
    const row = { user_id: userId, reason };
    if (postId) row.post_id = postId;
    if (commentId) row.comment_id = commentId;
    const { error } = await supabase.from('reports').insert(row);
    // A duplicate report (already reported) still counts as done.
    if (!error || error.code === '23505') setDone(true);
    if (ref.current) ref.current.open = false;
  }

  if (done) {
    return <span className="hint">Reported</span>;
  }

  return (
    <details className="menu" ref={ref}>
      <summary className="icon-btn" aria-label="Report">
        <Dots />
      </summary>
      <div className="menu-panel">
        <p>Report this</p>
        {REASONS.map((r) => (
          <button key={r.id} type="button" onClick={() => report(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
    </details>
  );
}
