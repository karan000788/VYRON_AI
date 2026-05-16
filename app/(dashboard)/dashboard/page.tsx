import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatINR } from '@/lib/utils';
import { formatIST } from '@/lib/datetime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const businessId = cookieStore.get('vyron_workspace')?.value;
  if (!businessId) redirect('/onboarding/workspace');

  const supabase = await createClient();

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, ai_credits_remaining')
    .eq('business_id', businessId)
    .single();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStart = startOfMonth.toISOString().slice(0, 10);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount_inr')
    .eq('business_id', businessId)
    .gte('transaction_date', monthStart);

  let income = 0;
  let expense = 0;
  for (const t of transactions ?? []) {
    const amt = Number(t.amount_inr);
    if (t.type === 'income') income += amt;
    if (t.type === 'expense') expense += amt;
  }

  const { count: leadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .neq('status', 'lost');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-400">
          {formatIST(new Date(), 'EEEE, d MMM yyyy')} · IST
        </p>
      </div>

      <DashboardStats
        income={income}
        expense={expense}
        leads={leadCount ?? 0}
        credits={sub?.ai_credits_remaining ?? 0}
        plan={sub?.plan ?? 'starter'}
        status={sub?.status ?? 'trialing'}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly summary</CardTitle>
            <CardDescription>Income vs expenses this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Income</span>
              <span className="text-emerald-400">{formatINR(income)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Expenses</span>
              <span className="text-red-400">{formatINR(expense)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-medium">
              <span>Net</span>
              <span>{formatINR(income - expense)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Plan and AI credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 capitalize">
            <p>
              Plan: <span className="text-cyan-400">{sub?.plan}</span>
            </p>
            <p>
              Status: <span className="text-violet-400">{sub?.status}</span>
            </p>
            <p>AI credits: {sub?.ai_credits_remaining ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
