'use server';

import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { trialEndsAt } from '@/lib/subscription/state-machine';
import { monthlyCreditsForPlan } from '@/lib/ai/credits';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createWorkspace(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const gstin = String(formData.get('gstin') ?? '').trim() || null;

  if (!name) throw new Error('Business name is required');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const businessId = crypto.randomUUID();
  const slug = `${slugify(name)}-${user.id.slice(0, 6)}`;

  const { error: bizError } = await supabase
    .from('businesses')
    .insert({
      id: businessId,
      name,
      slug,
      gstin,
      created_by: user.id,
    });

  if (bizError) throw new Error(bizError.message ?? 'Failed to create business');

  await supabase.from('memberships').insert({
    business_id: businessId,
    user_id: user.id,
    role: 'owner',
    accepted_at: new Date().toISOString(),
    created_by: user.id,
  });

  const trialEnd = trialEndsAt();
  await supabase.from('subscriptions').insert({
    business_id: businessId,
    plan: 'starter',
    status: 'trialing',
    trial_ends_at: trialEnd.toISOString(),
    ai_credits_remaining: monthlyCreditsForPlan('starter'),
    ai_credits_reset_at: trialEnd.toISOString(),
    created_by: user.id,
  });

  const cookieStore = await cookies();
  cookieStore.set('vyron_workspace', businessId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  redirect('/dashboard');
}

export async function switchWorkspace(businessId: string) {
  const cookieStore = await cookies();
  cookieStore.set('vyron_workspace', businessId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
