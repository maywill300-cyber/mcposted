'use client';

import { useActionState } from 'react';
import { sendCode } from './actions';
import { Arrow } from '@/components/icons';

export default function LoginForm() {
  const [state, action, pending] = useActionState(sendCode, null);

  return (
    <form action={action} className="field" style={{ gap: 12 }}>
      <label htmlFor="email">School email</label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="you@school.org"
        className="input"
      />
      {state?.error && (
        <p className="notice error" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        <span>{pending ? 'Sending...' : 'Send my login code'}</span>
        {!pending && <Arrow />}
      </button>
    </form>
  );
}
