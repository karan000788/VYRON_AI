import type { SubscriptionStatus } from '@/types/database';

export type SubscriptionEvent =
  | 'trial_started'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'grace_period_started'
  | 'suspended'
  | 'cancelled'
  | 'reactivated';

const transitions: Record<
  SubscriptionStatus,
  Partial<Record<SubscriptionEvent, SubscriptionStatus>>
> = {
  trialing: {
    payment_succeeded: 'active',
    payment_failed: 'payment_failed',
    cancelled: 'cancelled',
  },
  active: {
    payment_failed: 'payment_failed',
    cancelled: 'cancelled',
  },
  payment_failed: {
    payment_succeeded: 'active',
    grace_period_started: 'grace_period',
    suspended: 'suspended',
  },
  grace_period: {
    payment_succeeded: 'active',
    suspended: 'suspended',
    cancelled: 'cancelled',
  },
  suspended: {
    payment_succeeded: 'active',
    reactivated: 'active',
    cancelled: 'cancelled',
  },
  cancelled: {
    reactivated: 'active',
  },
};

export function transitionStatus(
  current: SubscriptionStatus,
  event: SubscriptionEvent
): SubscriptionStatus {
  const next = transitions[current]?.[event];
  if (!next) {
    throw new Error(`Invalid transition: ${current} + ${event}`);
  }
  return next;
}

export function canWrite(status: SubscriptionStatus): boolean {
  return ['trialing', 'active', 'payment_failed'].includes(status);
}

export function isReadOnly(status: SubscriptionStatus): boolean {
  return ['grace_period', 'cancelled'].includes(status);
}

export function isFullyBlocked(status: SubscriptionStatus): boolean {
  return status === 'suspended';
}

export function trialEndsAt(from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 7);
  return d;
}

export function paymentFailedRetentionEndsAt(from: Date): Date {
  const d = new Date(from);
  d.setHours(d.getHours() + 24);
  return d;
}

export function gracePeriodEndsAt(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 3);
  return d;
}

export function cancelledRetentionEndsAt(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 30);
  return d;
}
