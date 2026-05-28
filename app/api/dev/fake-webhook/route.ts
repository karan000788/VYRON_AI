import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { transitionStatus } from '@/lib/subscription/state-machine';

const isDev = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

export async function POST(request: Request) {
  // Production-grade security block
  if (process.env.NODE_ENV === 'production' || !isDev) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const { businessId, event } = (await request.json()) as { businessId: string; event: string };
    if (!businessId || !event) {
      return NextResponse.json({ error: 'Missing businessId or event parameters' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: sub } = await admin
      .from('subscriptions')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not resolved for active business workspace' }, { status: 404 });
    }

    if (event === 'payment.captured' || event === 'subscription.activated') {
      const next = transitionStatus(sub.status, 'payment_succeeded');
      await admin
        .from('subscriptions')
        .update({
          status: next,
          payment_failed_at: null,
          cancelled_at: null,
        })
        .eq('id', sub.id);
    } else if (event === 'payment.failed') {
      const next = transitionStatus(sub.status, 'payment_failed');
      await admin
        .from('subscriptions')
        .update({
          status: next,
          payment_failed_at: new Date().toISOString(),
        })
        .eq('id', sub.id);
    } else if (event === 'subscription.cancelled') {
      await admin
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', sub.id);
    } else if (event === 'grace_period') {
      const next = transitionStatus(sub.status, 'grace_period_started');
      await admin
        .from('subscriptions')
        .update({
          status: next,
        })
        .eq('id', sub.id);
    } else {
      return NextResponse.json({ error: 'Unsupported simulated event type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, simulatedEvent: event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
