'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export type AuthResult = { error?: string; message?: string };

export async function signInAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured. Check .env.local and restart the dev server.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error:
          'Email not confirmed. Check your inbox or disable “Confirm email” in Supabase → Authentication → Providers → Email.',
      };
    }
    if (error.message.toLowerCase().includes('invalid login')) {
      return {
        error:
          'Invalid email or password. If you are new, use “Start free trial” to create an account first.',
      };
    }
    return { error: error.message };
  }

  if (!data.session) {
    return {
      error:
        'Sign-in did not create a session. Confirm your email or turn off email confirmation in Supabase.',
    };
  }

  return redirectAfterAuth(supabase, data.user.id);
}

export async function signInWithGoogleAction(_formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check .env.local and restart the dev server.');
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/api/auth/callback?next=/dashboard`,
    },
  });

  if (error || !data.url) {
    throw new Error(error?.message || 'Google sign-in could not be started.');
  }

  redirect(data.url);
}

export async function signUpAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured. Check .env.local and restart the dev server.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const fullName = String(formData.get('fullName') ?? '').trim();
  const businessName = String(formData.get('businessName') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').replace(/\D/g, '');
  const gstin = String(formData.get('gstin') ?? '').trim().toUpperCase();
  const consent = formData.get('consent') === 'on';

  if (!consent) {
    return { error: 'Please accept the DPDP privacy consent.' };
  }

  if (!email || !password || password.length < 8) {
    return { error: 'Valid email and password (8+ characters) are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (!businessName) {
    return { error: 'Business name is required.' };
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { error: 'Enter a valid 10-digit Indian phone number for WhatsApp.' };
  }

  if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
    return { error: 'GST number must be a valid 15-character GSTIN.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
        phone: `+91${phone}`,
        gstin,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Sign up failed. Try again.' };
  }

  if (!data.session) {
    return {
      message:
        'Account created. Check your email to confirm, then sign in. (Or disable “Confirm email” in Supabase for instant access.)',
    };
  }

  try {
    await supabase.from('consent_records').insert({
      user_id: data.user.id,
      consent_type: 'dpdp',
      version: '1.0',
    });
    await supabase
      .from('users')
      .update({ dpdp_consent_at: new Date().toISOString() })
      .eq('id', data.user.id);
  } catch {
    /* non-blocking */
  }

  return redirectAfterAuth(supabase, data.user.id);
}

async function redirectAfterAuth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<never> {
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('business_id')
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)
    .limit(1)
    .maybeSingle();

  if (error) {
    redirect('/onboarding/workspace');
  }

  if (membership?.business_id) {
    const cookieStore = await cookies();
    cookieStore.set('vyron_workspace', membership.business_id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    redirect('/dashboard');
  }

  redirect('/onboarding/workspace');
}

/** Dev helper: confirm user email when confirmation is enabled */
export async function resendConfirmationEmail(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) return { error: error.message };
  return { message: 'Confirmation email sent.' };
}

export async function resetPasswordAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured. Check .env.local and restart the dev server.' };
  }

  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: 'Email is required.' };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/login`,
  });

  if (error) return { error: error.message };
  return { message: 'Password reset link sent. Check your inbox.' };
}
