import { createClient } from '@supabase/supabase-js';

// Full-access client for server code only (posting after the AI check,
// moderation, lunch ratings). Never import this from a 'use client' file.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
