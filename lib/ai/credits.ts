import type { SubscriptionPlan } from '@/types/database';
import { PLAN_CREDITS } from '@/types/subscription';

export function creditsForTokens(
  promptTokens: number,
  completionTokens: number
): number {
  return Math.ceil((promptTokens + completionTokens) / 1000);
}

export function monthlyCreditsForPlan(plan: SubscriptionPlan): number {
  return PLAN_CREDITS[plan];
}
