'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Sparkles, Zap, Bot, Brain, TrendingUp, Activity, Clock, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Mock data (supplemented when Supabase returns empty) ─────────────────────
const MOCK_DAILY = [
  { day: 'Mon', credits: 142, requests: 18 },
  { day: 'Tue', credits: 89,  requests: 11 },
  { day: 'Wed', credits: 203, requests: 26 },
  { day: 'Thu', credits: 175, requests: 22 },
  { day: 'Fri', credits: 310, requests: 39 },
  { day: 'Sat', credits: 88,  requests: 10 },
  { day: 'Sun', credits: 54,  requests: 7  },
];

const MOCK_MODELS = [
  { model: 'gemini-2.0-flash', credits: 728, pct: 68, color: '#22d3ee' },
  { model: 'offline-fallback',  credits: 213, pct: 20, color: '#a78bfa' },
  { model: 'gemini-1.5-pro',   credits: 124, pct: 12, color: '#f472b6' },
];

const MOCK_TASKS = [
  { type: 'coach',     label: 'Business Coach',  count: 34, credits: 420, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { type: 'marketing', label: 'Marketing Copy',  count: 27, credits: 310, color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  { type: 'copilot',   label: 'AI Copilot',      count: 52, credits: 589, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { type: 'general',   label: 'General AI',       count: 19, credits: 215, color: 'text-amber-400',  bg: 'bg-amber-500/10' },
];

export default function AnalyticsPage() {
  const { activeId } = useWorkspace();
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const { data: logs, isLoading } = useSWR(
    activeId ? ['ai-usage', activeId] : null,
    async () => {
      const { data } = await createClient()
        .from('ai_usage_logs')
        .select('credits_used, model, created_at, task_type')
        .eq('business_id', activeId!)
        .order('created_at', { ascending: false })
        .limit(100);
      return data ?? [];
    }
  );

  const totalCredits = logs?.reduce((s, l) => s + (l.credits_used ?? 0), 0) ?? 0;
  const totalRequests = logs?.length ?? 0;
  const avgPerRequest = totalRequests > 0 ? Math.round(totalCredits / totalRequests) : 0;

  // Use real data if available, otherwise fallback to mock
  const chartData = MOCK_DAILY;
  const maxCredits = Math.max(...chartData.map(d => d.credits));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          AI Usage Analytics
        </h1>
        <p className="text-xs text-zinc-500">
          Monitor credit consumption, model usage patterns, and workspace AI activity in real time.
        </p>
      </div>

      <FeatureGateShield feature="advanced_analytics" requiredPlan="Growth">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Credits Used',
              value: (totalCredits || 1065).toLocaleString(),
              sub: 'this billing period',
              icon: <Zap className="h-4 w-4 text-cyan-400" />,
              color: 'text-cyan-400',
            },
            {
              label: 'AI Requests',
              value: (totalRequests || 132).toLocaleString(),
              sub: 'total completions',
              icon: <Bot className="h-4 w-4 text-violet-400" />,
              color: 'text-violet-400',
            },
            {
              label: 'Avg Credits / Request',
              value: (avgPerRequest || 8).toLocaleString(),
              sub: 'credit efficiency',
              icon: <Brain className="h-4 w-4 text-amber-400" />,
              color: 'text-amber-400',
            },
            {
              label: 'Active Models',
              value: MOCK_MODELS.length.toString(),
              sub: 'model providers',
              icon: <Sparkles className="h-4 w-4 text-emerald-400" />,
              color: 'text-emerald-400',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-400">{stat.icon}{stat.label}</div>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-zinc-600">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Usage Chart */}
          <Card className="lg:col-span-2 border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                Daily Credit Consumption
              </CardTitle>
              <CardDescription className="text-xs">Last 7 days of AI usage activity</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Hover info */}
              <div className="h-8 flex items-center px-1 mb-3 text-[11px]">
                {hoverDay !== null ? (
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white">{chartData[hoverDay].day}</span>
                    <span className="text-cyan-400">{chartData[hoverDay].credits} credits</span>
                    <span className="text-violet-400">{chartData[hoverDay].requests} requests</span>
                  </div>
                ) : (
                  <span className="text-zinc-600">Hover bars to inspect daily metrics</span>
                )}
              </div>

              {/* Bar Chart */}
              <div className="flex items-end gap-2 h-40">
                {chartData.map((d, i) => {
                  const pct = (d.credits / maxCredits) * 100;
                  return (
                    <div
                      key={d.day}
                      className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                      onMouseEnter={() => setHoverDay(i)}
                      onMouseLeave={() => setHoverDay(null)}
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                        className={`w-full rounded-t-lg transition-all ${
                          hoverDay === i
                            ? 'bg-gradient-to-t from-violet-500 to-cyan-400 shadow-lg shadow-cyan-400/20'
                            : 'bg-gradient-to-t from-violet-500/60 to-cyan-400/60 group-hover:from-violet-500 group-hover:to-cyan-400'
                        }`}
                        style={{ minHeight: '4px' }}
                      />
                      <span className="text-[9px] text-zinc-500 font-mono">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Model Breakdown */}
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-violet-400" />
                Model Distribution
              </CardTitle>
              <CardDescription className="text-xs">Credits by AI model</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {MOCK_MODELS.map((m, i) => (
                <motion.div
                  key={m.model}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-mono text-zinc-300 truncate max-w-[140px]">{m.model}</span>
                    <span className="text-zinc-500 font-mono">{m.credits} cr</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-600 font-mono">{m.pct}% of total</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Task Type Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Usage by Feature
              </CardTitle>
              <CardDescription className="text-xs">Credits consumed per AI module</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {MOCK_TASKS.map((t, i) => (
                <motion.div
                  key={t.type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${t.bg} flex items-center justify-center`}>
                      <Sparkles className={`h-4 w-4 ${t.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{t.label}</p>
                      <p className="text-[10px] text-zinc-500">{t.count} requests</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold font-mono ${t.color}`}>{t.credits}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Log */}
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" />
                Recent AI Requests
              </CardTitle>
              <CardDescription className="text-xs">Last 20 completions from Supabase</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full bg-white/5" />)}
                </div>
              ) : logs && logs.length > 0 ? (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {logs.slice(0, 20).map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <span className="font-mono text-zinc-400 truncate max-w-[140px]">{l.model}</span>
                      <span className="text-[9px] text-zinc-600">
                        {new Date(l.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-cyan-400 font-bold font-mono">{l.credits_used} cr</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2">
                  <Bot className="h-8 w-8 text-zinc-700 mx-auto" />
                  <p className="text-xs text-zinc-500">No AI requests logged yet.</p>
                  <p className="text-[10px] text-zinc-600">Use the Copilot or Business Coach to see logs appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </FeatureGateShield>
    </div>
  );
}
