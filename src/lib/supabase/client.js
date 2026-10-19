'use client';

import { createBrowserClient } from '@supabase/ssr';

let client;

// Supabase client for the browser (votes, poll votes, reports).
export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}
