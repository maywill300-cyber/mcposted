'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createComment } from '../../new/actions';
import { Send } from '@/components/icons';

export default function ReplyForm({ postId, disabledReason }) {
  const [state, action, pending] = useActionState(createComment, null);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <div style={{ position: 'sticky', bottom: 0 }}>
      {(state?.error || state?.held || state?.support) && (
        <p
          className={'notice' + (state?.error ? ' error' : '')}
          role="alert"
          style={{ margin: '0 16px 8px' }}
        >
          {state.error || state.held || state.support}
        </p>
      )}
      <form action={action} className="reply-form">
        <input type="hidden" name="postId" value={postId} />
        <label htmlFor="reply" className="sr-only">Reply anonymously</label>
        <input
          ref={inputRef}
          id="reply"
          name="body"
          maxLength={280}
          autoComplete="off"
          placeholder={disabledReason ? 'Replies are off for your account' : 'Reply anonymously...'}
          disabled={!!disabledReason}
          defaultValue={state?.value || ''}
        />
        <button type="submit" className="round-btn" aria-label="Send reply" disabled={pending || !!disabledReason}>
          <Send />
        </button>
      </form>
    </div>
  );
}
