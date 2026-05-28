import type { SubscriptionPlan, SubscriptionStatus } from '@/types/database';

export type FeatureKey =
  | 'daily_briefing'
  | 'business_health'
  | 'smart_alerts'
  | 'business_coach'
  | 'whatsapp_automation'
  | 'lead_scoring'
  | 'marketing_engine'
  | 'gst_automation'
  | 'voice_assistant'
  | 'advanced_analytics'
  | 'multi_business'
  | 'profit_optimization'
  | 'forecasting';

export interface PlanFeatureAccess {
  daily_briefing: boolean;
  business_health: boolean;
  smart_alerts: boolean;
  business_coach: boolean;
  whatsapp_automation: boolean;
  lead_scoring: boolean;
  marketing_engine: boolean;
  gst_automation: boolean;
  voice_assistant: boolean;
  advanced_analytics: boolean;
  multi_business: boolean;
  profit_optimization: boolean;
  forecasting: boolean;
  team_limit: number;
}

export const TIER_CAPABILITIES: Record<SubscriptionPlan | 'trialing', PlanFeatureAccess> = {
  trialing: {
    daily_briefing: false,
    business_health: false,
    smart_alerts: false,
    business_coach: false,
    whatsapp_automation: false,
    lead_scoring: false,
    marketing_engine: false,
    gst_automation: false,
    voice_assistant: false,
    advanced_analytics: false,
    multi_business: false,
    profit_optimization: false,
    forecasting: false,
    team_limit: 1,
  },
  starter: {
    daily_briefing: true,
    business_health: false,
    smart_alerts: false,
    business_coach: false,
    whatsapp_automation: false,
    lead_scoring: false,
    marketing_engine: false,
    gst_automation: true,
    voice_assistant: true,
    advanced_analytics: false,
    multi_business: false,
    profit_optimization: false,
    forecasting: false,
    team_limit: 1,
  },
  growth: {
    daily_briefing: true,
    business_health: true,
    smart_alerts: true,
    business_coach: false,
    whatsapp_automation: true,
    lead_scoring: true,
    marketing_engine: true,
    gst_automation: true,
    voice_assistant: true,
    advanced_analytics: true,
    multi_business: false,
    profit_optimization: false,
    forecasting: false,
    team_limit: 5,
  },
  pro: {
    daily_briefing: true,
    business_health: true,
    smart_alerts: true,
    business_coach: true,
    whatsapp_automation: true,
    lead_scoring: true,
    marketing_engine: true,
    gst_automation: true,
    voice_assistant: true,
    advanced_analytics: true,
    multi_business: true,
    profit_optimization: true,
    forecasting: true,
    team_limit: 9999,
  },
};

export function hasFeatureAccess(
  status: SubscriptionStatus | undefined,
  plan: SubscriptionPlan | undefined,
  feature: FeatureKey
): boolean {
  if (status === 'trialing') {
    return TIER_CAPABILITIES.trialing[feature];
  }
  const activePlan = plan || 'starter';
  return TIER_CAPABILITIES[activePlan]?.[feature] ?? false;
}

export function getTeamLimit(
  status: SubscriptionStatus | undefined,
  plan: SubscriptionPlan | undefined
): number {
  if (status === 'trialing') {
    return TIER_CAPABILITIES.trialing.team_limit;
  }
  const activePlan = plan || 'starter';
  return TIER_CAPABILITIES[activePlan]?.team_limit ?? 1;
}
