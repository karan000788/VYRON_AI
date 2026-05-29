'use client';

import { PLAN_CREDITS } from '@/types/subscription';
import type { SubscriptionPlan } from '@/types/database';

export async function upgradeDevSubscription(businessId: string, plan: SubscriptionPlan) {
  const res = await fetch('/api/dev/upgrade-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId, plan }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Upgrade failed.');
  }

  return data.subscription as {
    id: string;
    business_id: string;
    plan: SubscriptionPlan;
    status: 'active';
    ai_credits_remaining: number;
  };
}

export const DEV_PLAN_CREDITS = PLAN_CREDITS;
