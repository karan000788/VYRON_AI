'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_CREDITS } from '@/types/subscription';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, CreditCard, Calendar, Zap, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for exploring AI capabilities.',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    credits: PLAN_CREDITS.starter,
    features: ['Access to basic AI models', 'Standard support', 'Community access', 'Basic reporting'],
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
  },
] as const;

export default function BillingPage() {
  const { subscription, access, isLoading } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);

  const isActive = subscription?.status === 'active';

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
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-vyron-cyan/30 bg-vyron-cyan/10 px-3 py-1 text-sm text-vyron-cyan">
                  <Sparkles className="h-4 w-4" />
                  <span>Premium Active</span>
                </div>
                <h2 className="text-2xl font-semibold text-white capitalize">
                  {subscription?.plan || 'Unknown'} Plan
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-zinc-500" />
                    <span>Status: <span className="text-emerald-400 font-medium capitalize">{subscription?.status}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-zinc-500" />
                    <span>AI Credits: <span className="text-white font-medium">{subscription?.ai_credits_remaining ?? 0}</span> remaining</span>
                  </div>
                  {/* Defaulting to a placeholder renewal text for visual completeness */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-zinc-500" />
                    <span>Renews automatically</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 group">
                  Manage Subscription
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
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-300">
                  <Zap className="h-4 w-4 text-zinc-400" />
                  <span>Free Tier Active</span>
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  You are currently using the free plan.
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Upgrade anytime to unlock premium AI models, priority support, and higher credit limits to supercharge your workflow.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm shadow-xl">
                  Continue Free
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Plans */}
      <div className="space-y-8 pt-8">
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
            const isCurrent = subscription?.plan === plan.id;
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
                  <p className="mt-3 text-sm font-medium text-vyron-cyan bg-vyron-cyan/10 inline-block px-3 py-1 rounded-full">
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
                  className={`w-full group rounded-xl transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-default' 
                      : plan.isPopular
                        ? 'bg-gradient-to-r from-vyron-cyan to-vyron-purple text-white hover:opacity-90 shadow-lg hover:shadow-vyron-cyan/25'
                        : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade Now'}
                  {!isCurrent && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
