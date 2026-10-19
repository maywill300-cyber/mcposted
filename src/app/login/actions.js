'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkSchoolEmail } from '@/lib/school';

export async function sendCode(prevState, formData) {
  const check = checkSchoolEmail(formData.get('email'));
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: check.email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    console.error(error);
    if (error.status === 429) {
      return { error: 'Too many codes sent. Wait a minute and try again.' };
    }
    return { error: "We couldn't send a code to that email. Check it and try again." };
  }

  redirect('/verify?email=' + encodeURIComponent(check.email));
}

export async function verifyCode(prevState, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const token = String(formData.get('code') || '').replace(/\s/g, '');
  if (!/^[0-9]{6,10}$/.test(token)) return { error: 'Enter the code from your email.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) {
    console.error(error);
    return { error: 'That code is wrong or expired. Try again or send a new one.' };
  }

  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
