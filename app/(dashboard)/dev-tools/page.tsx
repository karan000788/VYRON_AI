'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  activateStarterPlan,
  activateGrowthPlan,
  activateProPlan,
  resetSubscription,
  transitionDevSubscriptionState,
} from '@/lib/dev/fake-subscription';
import { generateDemoData, clearDemoData } from '@/lib/dev/demo-data';
import { useWorkspaceStore } from '@/stores/workspace-store';
import {
  ShieldAlert,
  Flame,
  Award,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
  Database,
  Trash2,
} from 'lucide-react';

const isDevMode = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

export default function DevToolsPage() {
  const router = useRouter();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [loading, setLoading] = useState(false);

  // Security guard: redirect if dev mode is disabled
  useEffect(() => {
    if (!isDevMode) {
      toast.error('Dev Tools are disabled in this environment.');
      router.push('/dashboard');
    }
  }, [router]);

  if (!isDevMode) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center space-y-2">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto animate-pulse" />
          <h1 className="text-lg font-bold">Access Denied</h1>
          <p className="text-xs text-zinc-500">Dev billing mode is inactive.</p>
        </div>
      </div>
    );
  }

  const handleActivateStarter = async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await activateStarterPlan(activeWorkspaceId);
      toast.success('Starter Plan activated (Dev Override)! 500 AI credits provisioned.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    }
    setLoading(false);
  };

  const handleActivateGrowth = async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await activateGrowthPlan(activeWorkspaceId);
      toast.success('Growth Plan activated (Dev Override)! 2000 AI credits provisioned.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    }
    setLoading(false);
  };

  const handleActivatePro = async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await activateProPlan(activeWorkspaceId);
      toast.success('Pro Plan activated (Dev Override)! 10000 AI credits provisioned.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    }
    setLoading(false);
  };

  const handleResetSubscription = async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await resetSubscription(activeWorkspaceId);
      toast.success('Subscription reset to trialing Starter plan.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    }
    setLoading(false);
  };

  const handleTransitionState = async (status: string) => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await transitionDevSubscriptionState(activeWorkspaceId, status);
      toast.success(`Subscription transitioned to "${status}" state!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'State transition failed.');
    }
    setLoading(false);
  };

  const handleTriggerWebhook = async (event: string) => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/dev/fake-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: activeWorkspaceId, event }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Webhook trigger failed.');
      toast.success(`Simulated event "${event}" resolved successfully!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleGenerateData = async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await generateDemoData(activeWorkspaceId);
      toast.success('Mock leads, invoices, and transactions successfully compiled!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleClearData = async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      await clearDemoData(activeWorkspaceId);
      toast.success('Workspace ledger successfully purged of demo records.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            Development Control Panel
          </h1>
          <p className="text-xs text-zinc-500">
            Dev Mode is globally enabled. Bypass billing verifications, populate mock ledgers, and trigger webhooks.
          </p>
        </div>
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 animate-pulse">
          DEV MODE ACTIVE
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Fast Subscription Upgrades */}
        <Card className="border border-red-500/20 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Award className="h-4.5 w-4.5 text-amber-400" />
              SaaS Plan Toggles
            </CardTitle>
            <CardDescription className="text-xs">Bypass Razorpay gateways instantly</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button onClick={handleActivateStarter} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-9 rounded-xl">
                Activate Starter
              </Button>
              <Button onClick={handleActivateGrowth} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-9 rounded-xl">
                Activate Growth
              </Button>
              <Button onClick={handleActivatePro} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-9 rounded-xl">
                Activate Pro
              </Button>
              <Button onClick={handleResetSubscription} disabled={loading} variant="destructive" className="h-9 rounded-xl">
                Reset Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Subscription States transitions */}
        <Card className="border border-red-500/20 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
              Test States Injector
            </CardTitle>
            <CardDescription className="text-xs">Inject state scenarios onto dashboards</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['trialing', 'active', 'payment_failed', 'grace_period', 'suspended', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  onClick={() => handleTransitionState(status)}
                  disabled={loading}
                  variant="outline"
                  className="border-white/5 bg-black/40 hover:bg-white/5 text-zinc-300 h-8 rounded-xl capitalize text-[10px]"
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Razorpay Webhook Simulator */}
        <Card className="border border-red-500/20 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Cpu className="h-4.5 w-4.5 text-violet-400" />
              Webhook Event Simulator
            </CardTitle>
            <CardDescription className="text-xs">Dispatch events to webhook API routes</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button onClick={() => handleTriggerWebhook('payment.captured')} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-8 text-[10px] rounded-xl">
                Payment Success
              </Button>
              <Button onClick={() => handleTriggerWebhook('payment.failed')} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-8 text-[10px] rounded-xl">
                Payment Failed
              </Button>
              <Button onClick={() => handleTriggerWebhook('subscription.cancelled')} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-8 text-[10px] rounded-xl">
                Cancelled Event
              </Button>
              <Button onClick={() => handleTriggerWebhook('grace_period')} disabled={loading} className="bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white h-8 text-[10px] rounded-xl">
                Grace Period
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Ledger Mock Data Engine */}
        <Card className="border border-red-500/20 bg-zinc-950/40 backdrop-blur-xl md:col-span-2 lg:col-span-3">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
              <Database className="h-4.5 w-4.5 text-emerald-400" />
              Ledger Demo Data Engine
            </CardTitle>
            <CardDescription className="text-xs">Populate transactions, GST invoices, and pipeline CRM records</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex gap-3 text-xs">
            <Button
              onClick={handleGenerateData}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold flex-1 h-10 rounded-xl gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Generate Demo Data Ledger
            </Button>
            
            <Button
              onClick={handleClearData}
              disabled={loading}
              variant="destructive"
              className="flex-1 h-10 rounded-xl gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Purge Demo Records
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
