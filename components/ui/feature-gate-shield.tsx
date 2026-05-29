'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFeatureGate } from '@/hooks/use-feature-gate';
import { useWorkspace } from '@/hooks/use-workspace';
import { type FeatureKey } from '@/lib/subscription/feature-gate';
import { upgradeDevSubscription } from '@/lib/dev/upgrade-subscription-client';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface FeatureGateShieldProps {
  feature: FeatureKey;
  requiredPlan: 'Starter' | 'Growth' | 'Pro';
  children: React.ReactNode;
  fallbackClassName?: string;
}

export function FeatureGateShield({
  feature,
  requiredPlan,
  children,
  fallbackClassName,
}: FeatureGateShieldProps) {
  const router = useRouter();
  const { activeId } = useWorkspace();
  const { checkAccess, isLoading } = useFeatureGate();
  const [upgradeLoading, setUpgradeLoading] = React.useState(false);
  const hasAccess = checkAccess(feature);
  const isDevMode = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

  const handleUpgrade = async () => {
    if (!isDevMode) {
      router.push('/billing#billing-plans');
      return;
    }

    if (!activeId) {
      toast.error('No active workspace resolved.');
      return;
    }

    const plan = requiredPlan.toLowerCase() as 'starter' | 'growth' | 'pro';

    setUpgradeLoading(true);
    try {
      await upgradeDevSubscription(activeId, plan);
      toast.success(`${requiredPlan} plan activated. Premium modules are unlocking now.`);
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Upgrade failed.');
      setUpgradeLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md animate-pulse">
        <Sparkles className="h-6 w-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 p-1 backdrop-blur-sm ${fallbackClassName}`}>
      <div className="pointer-events-none select-none filter blur-md opacity-25">
        {children}
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-[3px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center max-w-sm space-y-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Lock className="h-5 w-5" />
          </div>
          
          <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 justify-center">
            Premium Feature
          </h4>
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            This module requires the <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent font-bold">{requiredPlan}</span> plan or higher. Upgrade to unlock full business performance.
          </p>

          <div className="w-full pt-2">
            <Button
              onClick={handleUpgrade}
              disabled={upgradeLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/10 rounded-xl gap-2 text-xs h-9"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {upgradeLoading ? 'Activating...' : `Upgrade to ${requiredPlan}`}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
