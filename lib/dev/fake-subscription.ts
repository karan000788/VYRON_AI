'use server';

import { createClient } from '@/lib/supabase/server';

const isDev = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

function assertDevMode() {
  if (!isDev) {
    throw new Error('Unauthorized action: DEV_BILLING_MODE is disabled.');
  }
}

export async function activateStarterPlan(businessId: string) {
  assertDevMode();
  const supabase = await createClient();
  
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'starter',
      status: 'active',
      ai_credits_remaining: 500, // Starter credits in dev
      current_period_end: currentPeriodEnd.toISOString(),
      payment_failed_at: null,
      cancelled_at: null,
    })
    .eq('business_id', businessId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function activateGrowthPlan(businessId: string) {
  assertDevMode();
  const supabase = await createClient();

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'growth',
      status: 'active',
      ai_credits_remaining: 2000, // Growth credits in dev
      current_period_end: currentPeriodEnd.toISOString(),
      payment_failed_at: null,
      cancelled_at: null,
    })
    .eq('business_id', businessId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function activateProPlan(businessId: string) {
  assertDevMode();
  const supabase = await createClient();

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'pro',
      status: 'active',
      ai_credits_remaining: 10000, // Pro credits in dev
      current_period_end: currentPeriodEnd.toISOString(),
      payment_failed_at: null,
      cancelled_at: null,
    })
    .eq('business_id', businessId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function resetSubscription(businessId: string) {
  assertDevMode();
  const supabase = await createClient();

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'trialing',
      ai_credits_remaining: 100,
      current_period_end: null,
      trial_ends_at: trialEnd.toISOString(),
      payment_failed_at: null,
      cancelled_at: null,
    })
    .eq('business_id', businessId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function transitionDevSubscriptionState(businessId: string, status: string) {
  assertDevMode();
  const supabase = await createClient();
  
  const payload: any = { status };
  if (status === 'payment_failed') {
    payload.payment_failed_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    payload.cancelled_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(payload)
    .eq('business_id', businessId);

  if (error) throw new Error(error.message);
  return { success: true };
}
