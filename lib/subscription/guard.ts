import type { SubscriptionStatus } from '@/types/database';
import {
  canWrite,
  isFullyBlocked,
  isReadOnly,
} from './state-machine';

export interface AccessDecision {
  allowed: boolean;
  readOnly: boolean;
  blocked: boolean;
  reason?: string;
}

export function getAccessDecision(status: SubscriptionStatus): AccessDecision {
  if (isFullyBlocked(status)) {
    return {
      allowed: false,
      readOnly: true,
      blocked: true,
      reason: 'Your account is suspended. Update billing to continue.',
    };
  }
  if (isReadOnly(status)) {
    return {
      allowed: false,
      readOnly: true,
      blocked: false,
      reason:
        status === 'grace_period'
          ? 'Grace period: dashboard is read-only. Renew subscription.'
          : 'Subscription cancelled: read-only access for 30 days.',
    };
  }
  if (!canWrite(status)) {
    return {
      allowed: false,
      readOnly: true,
      blocked: false,
      reason: 'Subscription inactive.',
    };
  }
  return { allowed: true, readOnly: false, blocked: false };
}
