'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createPost } from './actions';

const CHANNELS = [
  { id: 'gossip', label: 'Gossip' },
  { id: 'confessions', label: 'Confessions' },
  { id: 'mysteries', label: 'Mysteries' },
  { id: 'events', label: 'Events' },
];

export default function ComposeForm({ blockedReason }) {
  const [state, action, pending] = useActionState(createPost, null);
  const [text, setText] = useState('');
  const [poll, setPoll] = useState(false);
  const [optionCount, setOptionCount] = useState(2);

  if (state?.support) {
    return (
      <main className="page tight">
        <div className="notice" role="alert">{state.support}</div>
        <Link href="/" className="btn light">Back to feed</Link>
      </main>
    );
  }

  return (
    <form action={action}>
      <header className="subbar" style={{ justifyContent: 'space-between' }}>
        <Link href="/" className="pill" style={{ border: 0, padding: '0 8px' }}>Cancel</Link>
        <h1 style={{ flexGrow: 0 }}>New post</h1>
        <button
          type="submit"
          className="pill"
          disabled={pending || !!blockedReason || !text.trim()}
          style={{ background: 'var(--accent)', boxShadow: '2px 2px 0 var(--ink)', fontWeight: 800 }}
        >
          {pending ? 'Checking...' : 'Post'}
        </button>
      </header>

      <main className="page tight" style={{ gap: 20 }}>
        {blockedReason && <p className="notice error" style={{ margin: 0 }}>{blockedReason}</p>}

        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Posting as Anonymous</p>
          <p className="hint" style={{ margin: '2px 0 0' }}>Nobody on McPosted can see who you are.</p>
        </div>

        {!poll && (
          <fieldset style={{ border: 0, margin: 0, padding: 0 }} className="field">
            <legend className="label" style={{ padding: 0, marginBottom: 10 }}>Channel</legend>
            <div className="chip-row">
              {CHANNELS.map((c, i) => (
                <label key={c.id}>
                  <input type="radio" name="channel" value={c.id} defaultChecked={i === 0} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="field">
          <label htmlFor="body">{poll ? 'Your question' : 'Your post'}</label>
          <textarea
            id="body"
            name="body"
            className="textarea"
            maxLength={280}
            placeholder={poll ? 'Ask something. No names.' : 'Write something. No names.'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="pill" style={{ height: 40, fontSize: 14, gap: 8 }}>
              <input type="checkbox" name="poll" checked={poll} onChange={(e) => setPoll(e.target.checked)} />
              Make it a poll
            </label>
            <span className="hint">{280 - text.length} left</span>
          </div>
        </div>

        {poll && (
          <div className="field">
            <span className="label">Options</span>
            {Array.from({ length: optionCount }).map((_, i) => (
              <input
                key={i}
                name="option"
                className="input"
                style={{ height: 48 }}
                maxLength={60}
                placeholder={`Option ${i + 1}`}
                aria-label={`Option ${i + 1}`}
              />
            ))}
            {optionCount < 4 && (
              <button type="button" className="btn light small" onClick={() => setOptionCount(optionCount + 1)}>
                Add an option
              </button>
            )}
          </div>
        )}

        {state?.error && <p className="notice error" role="alert" style={{ margin: 0 }}>{state.error}</p>}

        <section className="card">
          <h2 className="section" style={{ fontSize: 16 }}>Quick check before you post</h2>
          <ul className="rule-list">
            <li><b>No names, ever.</b> No full names, initials, or nicknames.</li>
            <li>No threats, bullying, or anyone's private info.</li>
            <li>Every post gets an automatic check. Posts that get reported a few times are hidden until a moderator looks.</li>
          </ul>
        </section>
      </main>
    </form>
  );
}
