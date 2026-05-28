import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { formatIST } from '@/lib/datetime';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DailyBriefing } from '@/components/dashboard/daily-briefing';
import { BusinessHealthScore } from '@/components/dashboard/health-score';
import { SmartAlertSystem } from '@/components/dashboard/smart-alerts';
import { LoyaltyRewards } from '@/components/dashboard/loyalty';
import { SmartOnboarding } from '@/components/dashboard/smart-onboarding';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const businessId = cookieStore.get('vyron_workspace')?.value;
  if (!businessId) redirect('/onboarding/workspace');

  const supabase = await createClient();

  // Fetch subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, ai_credits_remaining')
    .eq('business_id', businessId)
    .single();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStart = startOfMonth.toISOString().slice(0, 10);

  // Fetch MTD transactions for quick count summaries
  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount_inr')
    .eq('business_id', businessId)
    .eq('deleted_at', null)
    .gte('transaction_date', monthStart);

  let income = 0;
  let expense = 0;
  for (const t of transactions ?? []) {
    const amt = Number(t.amount_inr);
    if (t.type === 'income') income += amt;
    if (t.type === 'expense') expense += amt;
  }

  // Fetch leads
  const { count: leadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .neq('status', 'lost');

  return (
    <div className="space-y-8 relative z-10">
      {/* Dynamic welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-xs text-zinc-500">
            {formatIST(new Date(), 'EEEE, d MMM yyyy')} · India Standard Time
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-zinc-400 font-mono">
          MTD ledger calculations active
        </span>
      </div>

      {/* Overview Stats Cards */}
      <DashboardStats
        income={income}
        expense={expense}
        leads={leadCount ?? 0}
        credits={sub?.ai_credits_remaining ?? 0}
        plan={sub?.plan ?? 'starter'}
        status={sub?.status ?? 'trialing'}
      />

      {/* Advanced Financial SVG Charts */}
      <DashboardCharts businessId={businessId} />

      {/* Onboarding Checklist */}
      <SmartOnboarding />

      {/* Core Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <DailyBriefing 
            income={income} 
            expense={expense} 
            leads={leadCount ?? 0} 
          />
          <BusinessHealthScore 
            income={income} 
            expense={expense} 
            leads={leadCount ?? 0} 
          />
        </div>

        <div className="space-y-6">
          <SmartAlertSystem 
            income={income} 
            expense={expense} 
            credits={sub?.ai_credits_remaining ?? 0} 
          />
          <LoyaltyRewards />
        </div>
      </div>
    </div>
  );
}
