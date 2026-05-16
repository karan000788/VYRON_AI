'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_CREDITS } from '@/types/subscription';

const PLANS = [
  { id: 'starter', name: 'Starter', price: '₹999/mo', credits: PLAN_CREDITS.starter },
  { id: 'growth', name: 'Growth', price: '₹2,499/mo', credits: PLAN_CREDITS.growth },
  { id: 'pro', name: 'Pro', price: '₹4,999/mo', credits: PLAN_CREDITS.pro },
] as const;

export default function BillingPage() {
  const { subscription, access, isLoading } = useSubscription();

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-zinc-400">Razorpay subscriptions</p>
      </div>
      {access?.reason && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          {access.reason}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">Current: {subscription?.plan ?? '—'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 capitalize">
          <p>Status: {subscription?.status}</p>
          <p>AI credits: {subscription?.ai_credits_remaining ?? 0}</p>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={subscription?.plan === plan.id ? 'ring-2 ring-cyan-500' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-bold">{plan.price}</p>
              <p className="text-sm text-zinc-400">{plan.credits} AI credits / month</p>
              <Button variant="secondary" className="w-full" disabled={subscription?.plan === plan.id}>
                {subscription?.plan === plan.id ? 'Current plan' : 'Upgrade via Razorpay'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
