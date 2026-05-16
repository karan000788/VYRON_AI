import type { SubscriptionPlan } from '@/types/database';

export type AITaskType = 'basic' | 'advanced' | 'workflow';

export function routeAIModel(
  plan: SubscriptionPlan,
  taskType: AITaskType
): 'gpt-4o-mini' | 'gpt-4o' {
  if (plan === 'starter') return 'gpt-4o-mini';
  if (plan === 'growth' && taskType === 'advanced') return 'gpt-4o';
  if (plan === 'pro') return 'gpt-4o';
  return 'gpt-4o-mini';
}
