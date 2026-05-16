import { describe, it, expect } from 'vitest';
import { transitionStatus, canWrite, isReadOnly } from '@/lib/subscription/state-machine';

describe('subscription state machine', () => {
  it('trialing to active on payment', () => {
    expect(transitionStatus('trialing', 'payment_succeeded')).toBe('active');
  });

  it('payment_failed to grace_period', () => {
    expect(transitionStatus('payment_failed', 'grace_period_started')).toBe(
      'grace_period'
    );
  });

  it('access flags', () => {
    expect(canWrite('active')).toBe(true);
    expect(isReadOnly('grace_period')).toBe(true);
  });
});
