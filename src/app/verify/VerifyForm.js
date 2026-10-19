'use client';

import { useActionState } from 'react';
import { verifyCode } from '../login/actions';

export default function VerifyForm({ email }) {
  const [state, action, pending] = useActionState(verifyCode, null);

  return (
    <form action={action} className="field" style={{ gap: 12 }}>
      <input type="hidden" name="email" value={email} />
      <label htmlFor="code">Login code</label>
      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]*"
        maxLength={12}
        required
        className="input"
        style={{ fontSize: 28, letterSpacing: '0.3em', textAlign: 'center' }}
      />
      {state?.error && (
        <p className="notice error" role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Checking...' : 'Sign in'}
      </button>
    </form>
  );
}
