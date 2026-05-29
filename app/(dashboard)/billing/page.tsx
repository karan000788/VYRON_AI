'use client';

import { useRef, useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_CREDITS } from '@/types/subscription';
import { useWorkspaceStore } from '@/stores/workspace-store';
import {
  activateStarterPlan,
  activateGrowthPlan,
  activateProPlan,
  resetSubscription,
} from '@/lib/dev/fake-subscription';
import { upgradeDevSubscription } from '@/lib/dev/upgrade-subscription-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, CreditCard, Calendar, Zap, ArrowRight, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for exploring AI capabilities.',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    credits: PLAN_CREDITS.starter,
    features: ['Access to basic AI models', 'Standard support', 'Community access', 'Basic reporting'],
    isPopular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Ideal for professionals scaling up.',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    credits: PLAN_CREDITS.growth,
    features: ['Advanced AI models', 'Priority email support', 'API access', 'Advanced analytics'],
    isPopular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users needing maximum performance.',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    credits: PLAN_CREDITS.pro,
    features: ['All Premium models', '24/7 dedicated support', 'Custom integrations', 'White-labeling'],
    isPopular: false,
  },
] as const;

const MOCK_INVOICES = [
  { id: 'VYR-2026-00001', service: 'Starter Subscription', amount: '₹999', date: 'May 05, 2026', status: 'Paid' },
  { id: 'VYR-2026-00002', service: 'Growth Add-on credits', amount: '₹1,499', date: 'May 12, 2026', status: 'Paid' },
];

export default function BillingPage() {
  const { subscription, access, isLoading } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [devLoading, setDevLoading] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const plansRef = useRef<HTMLDivElement>(null);

  const isActive = subscription?.status === 'active';
  const isDevMode = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

  // Compute AI credit utilization
  const planLimits: Record<string, number> = {
    free: 100,
    starter: 500,
    growth: 2000,
    pro: 10000,
  };
  const currentPlan = subscription?.plan || 'free';
  const totalCredits = planLimits[currentPlan] || 100;
  const remainingCredits = subscription?.ai_credits_remaining ?? 0;
  const creditsUsed = Math.max(0, totalCredits - remainingCredits);
  const usedPercent = Math.min(100, Math.round((creditsUsed / totalCredits) * 100));

  const handleDevUpgrade = async (action: () => Promise<any>, successMsg: string) => {
    if (!activeWorkspaceId) {
      toast.error('No active workspace resolved.');
      return;
    }
    setDevLoading(true);
    try {
      await action();
      toast.success(successMsg);
      // Wait for state updates then refresh hydration context
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Upgrade failed.');
    }
    setDevLoading(false);
  };

  const handlePlanCheckout = async (plan: (typeof PLANS)[number]) => {
    if (!isDevMode) {
      toast.error('Payment gateway is not configured for this environment yet.');
      return;
    }

    await handleDevUpgrade(
      () => upgradeDevSubscription(activeWorkspaceId!, plan.id),
      `${plan.name} activated! ${plan.credits.toLocaleString()} AI credits provisioned.`
    );
  };

  const openBillingManagement = () => {
    setManagementOpen(true);
    setTimeout(() => {
      plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-4 md:p-8">
        <Skeleton className="h-12 w-48 bg-white/5" />
        <Skeleton className="h-[200px] w-full rounded-2xl bg-white/5" />
        <div className="grid gap-6 md:grid-cols-3 pt-8">
          <Skeleton className="h-[500px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[500px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[500px] rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-12 p-4 pb-20 md:p-8">
      {/* Dev Mode Control Panel */}
      {isDevMode && (
        <Card className="border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-red-500/10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="h-4 w-4" />
                Dev Mode Billing Bypass active
              </CardTitle>
              <span className="text-[10px] text-zinc-500 font-mono">Bypass gateways locally</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-wrap gap-2.5">
            <Button
              onClick={() => handleDevUpgrade(() => activateStarterPlan(activeWorkspaceId!), 'Starter activated! 500 AI credits provisioned.')}
              disabled={devLoading}
              className="bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-extrabold text-[10px] h-8 rounded-lg"
            >
              Activate Starter Test
            </Button>
            <Button
              onClick={() => handleDevUpgrade(() => activateGrowthPlan(activeWorkspaceId!), 'Growth activated! 2000 AI credits provisioned.')}
              disabled={devLoading}
              className="bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-extrabold text-[10px] h-8 rounded-lg"
            >
              Activate Growth Test
            </Button>
            <Button
              onClick={() => handleDevUpgrade(() => activateProPlan(activeWorkspaceId!), 'Pro activated! 10000 AI credits provisioned.')}
              disabled={devLoading}
              className="bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-extrabold text-[10px] h-8 rounded-lg"
            >
              Activate Pro Test
            </Button>
            <Button
              onClick={() => handleDevUpgrade(() => resetSubscription(activeWorkspaceId!), 'Subscription reset to trial state.')}
              disabled={devLoading}
              variant="destructive"
              className="font-bold text-[10px] h-8 rounded-lg"
            >
              Reset Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Billing & Plans
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-zinc-400"
        >
          Manage your subscription and unlock the full potential of AI.
        </motion.p>
      </div>

      {access?.reason && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 shadow-lg shadow-amber-500/5 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-400" />
            <p>{access.reason}</p>
          </div>
        </motion.div>
      )}

      {/* Subscription Status Section */}
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute -inset-0.5 bg-vyron-gradient opacity-10 blur-2xl" />
            
            <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-vyron-cyan/30 bg-vyron-cyan/10 px-3 py-1 text-sm text-vyron-cyan">
                    <Sparkles className="h-4 w-4" />
                    <span>Premium Active</span>
                  </div>
                  {isDevMode && (
                    <span className="rounded-full bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-0.5 text-xs font-bold font-mono">
                      DEV MODE ACTIVE
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-white capitalize">
                  {subscription?.plan || 'Unknown'} Plan
                </h2>
                
                {/* Credit Usage Progress Bar */}
                <div className="max-w-md space-y-2">
                  <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                    <span>AI Credit Usage: {creditsUsed.toLocaleString()} / {totalCredits.toLocaleString()}</span>
                    <span>{usedPercent}% used</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                      animate={{ width: `${usedPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-zinc-500" />
                    <span>Status: <span className="text-emerald-400 font-medium capitalize">{subscription?.status}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-zinc-500" />
                    <span>AI Credits: <span className="text-white font-medium">{subscription?.ai_credits_remaining ?? 0}</span> remaining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-zinc-500" />
                    <span>Renews automatically</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button size="lg" onClick={openBillingManagement} className="bg-white text-black hover:bg-zinc-200 group">
                  Update Subscription
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="free-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black/50 p-8 shadow-xl backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-vyron-cyan/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-vyron-purple/20 blur-[100px]" />
            
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl space-y-4">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-300">
                    <Zap className="h-4 w-4 text-zinc-400" />
                    <span>Free Tier Active</span>
                  </div>
                  {isDevMode && (
                    <span className="rounded-full bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-0.5 text-xs font-bold font-mono">
                      DEV MODE ACTIVE
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  You are currently using the free plan.
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Upgrade anytime to unlock premium AI models, priority support, and higher credit limits to supercharge your workflow.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Button size="lg" variant="outline" onClick={openBillingManagement} className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm shadow-xl">
                  View Upgrade Plans
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Plans */}
      <div
        ref={plansRef}
        id="billing-plans"
        className={`space-y-8 pt-8 scroll-mt-8 transition-all duration-500 ${
          managementOpen ? 'rounded-2xl ring-1 ring-vyron-cyan/40 ring-offset-4 ring-offset-black/0' : ''
        }`}
      >
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <h3 className="text-2xl font-bold text-white">Upgrade your plan</h3>
            <p className="text-zinc-400 mt-1">Choose the perfect plan for your needs.</p>
          </div>
          
          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md shadow-inner">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                !isYearly ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isYearly ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Yearly 
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isYearly ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-emerald-500'}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {PLANS.map((plan, i) => {
            const isCurrent = isActive && subscription?.plan === plan.id;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const formattedPrice = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(price);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border p-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
                  plan.isPopular 
                    ? 'border-vyron-cyan/50 bg-vyron-cyan/5 shadow-[0_0_40px_-10px_rgba(34,211,238,0.2)]' 
                    : isCurrent 
                      ? 'border-white/20 bg-white/5 shadow-xl' 
                      : 'border-white/10 bg-black/40 shadow-lg hover:border-white/20 hover:bg-black/60'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="rounded-full bg-gradient-to-r from-vyron-cyan to-vyron-purple px-4 py-1 text-xs font-bold text-white shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6 mt-2">
                  <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                  <p className="mt-2 text-sm text-zinc-400 h-10">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white tracking-tight">{formattedPrice}</span>
                    <span className="text-sm font-medium text-zinc-500">/{isYearly ? 'yr' : 'mo'}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-vyron-cyan bg-vyron-cyan/10 inline-block px-3 py-1 rounded-full text-xs">
                    {plan.credits.toLocaleString()} AI credits / mo
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="rounded-full bg-white/5 p-1">
                        <Check className="h-4 w-4 shrink-0 text-white" />
                      </div>
                      <span className="text-sm text-zinc-300 leading-tight pt-0.5">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg"
                  onClick={() => handlePlanCheckout(plan)}
                  className={`w-full group rounded-xl transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-default' 
                      : plan.isPopular
                        ? 'bg-gradient-to-r from-vyron-cyan to-vyron-purple text-white hover:opacity-90 shadow-lg hover:shadow-vyron-cyan/25'
                        : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                  disabled={isCurrent || devLoading}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                  {!isCurrent && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div
        id="billing-invoices"
        className={`space-y-6 pt-6 transition-all duration-500 ${
          managementOpen ? 'rounded-2xl ring-1 ring-white/10 ring-offset-4 ring-offset-black/0' : ''
        }`}
      >
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-1.5">
            <FileText className="h-5 w-5 text-violet-400" />
            Invoice Ledger History
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Immutable payment compliance summaries</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden text-xs">
          <div className="grid grid-cols-5 p-3.5 bg-white/5 border-b border-white/5 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
            <span>Invoice ID</span>
            <span>Plan Target</span>
            <span>Amount</span>
            <span>Date Recieved</span>
            <span className="text-right">Status</span>
          </div>

          <div className="divide-y divide-white/5">
            {MOCK_INVOICES.map((inv) => (
              <div key={inv.id} className="grid grid-cols-5 p-3.5 items-center font-mono text-zinc-300">
                <span>{inv.id}</span>
                <span>{inv.service}</span>
                <span className="font-bold text-white">{inv.amount}</span>
                <span>{inv.date}</span>
                <span className="text-right flex items-center justify-end gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
