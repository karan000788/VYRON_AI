import type { SubscriptionPlan } from '@/types/database';

export type AITaskType = 'basic' | 'advanced' | 'workflow';

export function routeAIModel(
  plan: SubscriptionPlan,
  taskType: AITaskType
): 'gemini-2.0-flash' {
  return 'gemini-2.0-flash';
}

