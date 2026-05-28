import { createAdminClient } from '@/lib/supabase/admin';
import type { SubscriptionPlan } from '@/types/database';
import { routeAIModel, type AITaskType } from './route-model';
import { creditsForTokens } from './credits';
import { generateText, type ModelMessage } from 'ai';
import { google } from '@ai-sdk/google';

const ABUSE_WINDOW_MS = 10 * 60 * 1000;
const ABUSE_THRESHOLD = 100;

export class AIQuotaError extends Error {
  constructor(
    message: string,
    public code: 'NO_CREDITS' | 'ABUSE' | 'PLAN_DENIED' | 'SUSPENDED'
  ) {
    super(message);
    this.name = 'AIQuotaError';
  }
}

export async function checkAbuse(businessId: string): Promise<void> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - ABUSE_WINDOW_MS).toISOString();
  const { count } = await admin
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', since);

  if ((count ?? 0) > ABUSE_THRESHOLD) {
    throw new AIQuotaError('Too many AI requests. Try again later.', 'ABUSE');
  }
}

export async function enforceQuota(businessId: string): Promise<{
  plan: SubscriptionPlan;
  creditsRemaining: number;
  status: string;
}> {
  const admin = createAdminClient();
  const { data: sub, error } = await admin
    .from('subscriptions')
    .select('plan, status, ai_credits_remaining')
    .eq('business_id', businessId)
    .single();

  if (error || !sub) {
    throw new AIQuotaError('Subscription not found', 'SUSPENDED');
  }

  const isDevMode = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

  if (isDevMode) {
    return {
      plan: sub.plan as SubscriptionPlan,
      creditsRemaining: 999999,
      status: 'active',
    };
  }

  if (['suspended'].includes(sub.status)) {
    throw new AIQuotaError('Account suspended', 'SUSPENDED');
  }

  if (sub.ai_credits_remaining <= 0) {
    throw new AIQuotaError('AI credits exhausted', 'NO_CREDITS');
  }

  await checkAbuse(businessId);

  return {
    plan: sub.plan as SubscriptionPlan,
    creditsRemaining: sub.ai_credits_remaining,
    status: sub.status,
  };
}

export async function runAIRequest(params: {
  businessId: string;
  userId: string;
  taskType: AITaskType;
  messages: ModelMessage[];
  requestId?: string;
}): Promise<{ content: string; model: string; creditsUsed: number }> {
  const { plan } = await enforceQuota(params.businessId);
  const model = routeAIModel(plan, params.taskType);

  if (plan === 'starter' && params.taskType !== 'basic') {
    throw new AIQuotaError('Upgrade plan for this AI feature', 'PLAN_DENIED');
  }

  const { text: content, usage } = await generateText({
    model: google(model),
    messages: params.messages,
    temperature: 0.4,
  });

  const promptTokens = usage.inputTokens ?? 0;
  const completionTokens = usage.outputTokens ?? 0;
  const creditsUsed = creditsForTokens(promptTokens, completionTokens);

  const admin = createAdminClient();
  const isDevMode = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

  if (!isDevMode) {
    const { error: rpcError } = await admin.rpc('decrement_ai_credits', {
      p_business_id: params.businessId,
      p_amount: creditsUsed,
    });
    if (rpcError) {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('ai_credits_remaining')
        .eq('business_id', params.businessId)
        .single();
      const remaining = Math.max(0, (sub?.ai_credits_remaining ?? 0) - creditsUsed);
      await admin
        .from('subscriptions')
        .update({ ai_credits_remaining: remaining })
        .eq('business_id', params.businessId);
    }
  }

  await admin.from('ai_usage_logs').insert({
    business_id: params.businessId,
    user_id: params.userId,
    model,
    task_type: params.taskType,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    credits_used: creditsUsed,
    request_id: params.requestId ?? crypto.randomUUID(),
    created_by: params.userId,
  });

  return { content, model, creditsUsed };
}
