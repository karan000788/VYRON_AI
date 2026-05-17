import type { SubscriptionPlan } from '@/types/database';

export type AITaskType = 'basic' | 'advanced' | 'workflow';

export function routeAIModel(
  plan: SubscriptionPlan,
  taskType: AITaskType
): 'gemini-1.5-flash' | 'gemini-1.5-pro' {
  if (plan === 'starter') return 'gemini-1.5-flash';
  if (plan === 'growth' && taskType === 'advanced') return 'gemini-1.5-pro';
  if (plan === 'pro') return 'gemini-1.5-pro';
  return 'gemini-1.5-flash';
}
