import type { SubscriptionPlan, SubscriptionStatus } from './database';

export interface SubscriptionContext {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  aiCreditsRemaining: number;
  canWrite: boolean;
  isReadOnly: boolean;
}

export const PLAN_CREDITS: Record<SubscriptionPlan, number> = {
  starter: 500,
  growth: 2000,
  pro: 10000,
};
