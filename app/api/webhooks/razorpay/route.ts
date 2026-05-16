import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { transitionStatus } from '@/lib/subscription/state-machine';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    payload: {
      subscription?: { entity: { id: string; status: string } };
      payment?: { entity: { id: string } };
    };
  };

  const admin = createAdminClient();

  if (event.event === 'subscription.activated' || event.event === 'payment.captured') {
    const razorpayId = event.payload.subscription?.entity.id;
    if (razorpayId) {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('id, status')
        .eq('razorpay_subscription_id', razorpayId)
        .single();

      if (sub) {
        const next = transitionStatus(sub.status as 'trialing', 'payment_succeeded');
        await admin
          .from('subscriptions')
          .update({ status: next, payment_failed_at: null })
          .eq('id', sub.id);
      }
    }
  }

  if (event.event === 'payment.failed') {
    const razorpayId = event.payload.subscription?.entity.id;
    if (razorpayId) {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('id, status')
        .eq('razorpay_subscription_id', razorpayId)
        .single();

      if (sub && ['active', 'trialing'].includes(sub.status)) {
        const next = transitionStatus(sub.status as 'active', 'payment_failed');
        await admin
          .from('subscriptions')
          .update({
            status: next,
            payment_failed_at: new Date().toISOString(),
          })
          .eq('id', sub.id);
      }
    }
  }

  if (event.event === 'subscription.cancelled') {
    const razorpayId = event.payload.subscription?.entity.id;
    if (razorpayId) {
      await admin
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', razorpayId);
    }
  }

  return NextResponse.json({ received: true });
}
