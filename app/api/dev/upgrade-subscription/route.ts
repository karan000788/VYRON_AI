import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLAN_CREDITS } from '@/types/subscription';
import type { SubscriptionPlan } from '@/types/database';

const isDev = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';
const PLAN_IDS: SubscriptionPlan[] = ['starter', 'growth', 'pro'];

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production' || !isDev) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const { businessId, plan } = (await request.json()) as {
      businessId?: string;
      plan?: SubscriptionPlan;
    };

    if (!businessId || !plan) {
      return NextResponse.json({ error: 'Missing businessId or plan.' }, { status: 400 });
    }

    if (!PLAN_IDS.includes(plan)) {
      return NextResponse.json({ error: 'Unsupported subscription plan.' }, { status: 400 });
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(currentPeriodStart);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('subscriptions')
      .update({
        plan,
        status: 'active',
        ai_credits_remaining: PLAN_CREDITS[plan],
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        payment_failed_at: null,
        grace_period_ends_at: null,
        suspended_at: null,
        cancelled_at: null,
      })
      .eq('business_id', businessId)
      .select('id, business_id, plan, status, ai_credits_remaining')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No subscription row exists for the active workspace.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, subscription: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
