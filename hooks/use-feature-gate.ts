'use client';

import { useSubscription } from './use-subscription';
import { hasFeatureAccess, getTeamLimit, type FeatureKey } from '@/lib/subscription/feature-gate';

export function useFeatureGate() {
  const { subscription, isLoading } = useSubscription();

  const checkAccess = (feature: FeatureKey): boolean => {
    if (isLoading) return false;
    return hasFeatureAccess(subscription?.status, subscription?.plan, feature);
  };

  const plan = subscription?.status === 'trialing' ? 'free_trial' : (subscription?.plan || 'starter');

  return {
    checkAccess,
    plan,
    status: subscription?.status || 'trialing',
    creditsRemaining: subscription?.ai_credits_remaining ?? 0,
    teamLimit: getTeamLimit(subscription?.status, subscription?.plan),
    isLoading,
  };
}
