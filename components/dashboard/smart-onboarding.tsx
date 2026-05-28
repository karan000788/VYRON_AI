'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Sparkles, Building2, Flame, Award, ChevronRight, Users2, FileText, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';

type BusinessType = 'Freelancer' | 'Agency' | 'Restaurant' | 'Retail Shop' | 'Startup' | 'Creator' | 'Student' | 'Consultant';

interface OnboardingTask {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

const BUSINESS_TEMPLATES: Record<BusinessType, { kpis: string[]; strategy: string; focus: string }> = {
  Freelancer: {
    kpis: ['Billable Hour Utility: 85%', 'Average Invoice Cycle: 9 Days', 'Lead-to-Contract: 40%'],
    strategy: 'Prioritize hourly margin tracking and automated invoice collections on WhatsApp.',
    focus: 'Hourly Billing & Late Fees',
  },
  Agency: {
    kpis: ['Client Retention Rate: 92%', 'Team Utilization: 78%', 'Proposal Win Rate: 34%'],
    strategy: 'Coordinate multi-member workflows and schedule campaigns using the AI Marketing engine.',
    focus: 'Client Retainers & Proposals',
  },
  Restaurant: {
    kpis: ['Table Turnover: 45 min', 'Food Cost Ratio: 28%', 'Repeat Patrons: 64%'],
    strategy: 'Trigger discount copy campaigns during lean hours and audit daily supplier invoices.',
    focus: 'Supply Margins & Table KPIs',
  },
  'Retail Shop': {
    kpis: ['Inventory Turn Cycle: 14 Days', 'Gross Margin: 42%', 'Average Basket: ₹850'],
    strategy: 'Analyze GST tax brackets (Intra/Inter state) and dispatch seasonal festival greetings.',
    focus: 'Inventory Turns & GST filing',
  },
  Startup: {
    kpis: ['Monthly Burn Rate: ₹4.5L', 'LTV to CAC Ratio: 4.2x', 'Churn Rate: 2.1%'],
    strategy: 'Leverage AI Business Coach consultations to optimize product pricing parameters.',
    focus: 'Growth Loops & Burn Rates',
  },
  Creator: {
    kpis: ['Sponsorship Revenue: +24%', 'Audience Growth: 8.5%', 'Sponsor CTR: 3.8%'],
    strategy: 'Draft engaging ad copy video script templates and schedule personal study tasks.',
    focus: 'Brand Deals & Ad Copy',
  },
  Student: {
    kpis: ['Study Budget Spent: ₹3,500', 'Assignments Done: 88%', 'Discount Applied: 35%'],
    strategy: 'Use the Student Hub to track allowances and coordinate college project checkpoints.',
    focus: 'Budget Allowance & Exams',
  },
  Consultant: {
    kpis: ['Consulting Margin: 94%', 'Booking Conversion: 68%', 'Active retainers: 4'],
    strategy: 'Optimize lead priority scoring index to target high-intent advisory packages.',
    focus: 'Advisory Retainers & Hot Leads',
  },
};

const DEFAULT_TASKS: OnboardingTask[] = [
  { id: '1', label: 'Add first transaction', href: '/transactions', done: false },
  { id: '2', label: 'Create first GST invoice', href: '/invoices', done: false },
  { id: '3', label: 'Add first pipeline lead', href: '/leads', done: false },
  { id: '4', label: 'Connect WATI WhatsApp', href: '/settings/whatsapp', done: false },
  { id: '5', label: 'Setup student status / discounts', href: '/settings/student', done: false },
  { id: '6', label: 'Invite initial team member', href: '/settings/team', done: false },
];

export function SmartOnboarding() {
  const [bizType, setBizType] = useState<BusinessType>('Freelancer');
  const [tasks, setTasks] = useState<OnboardingTask[]>(DEFAULT_TASKS);
  
  // Daily login habit loops state
  const [loginStreak, setLoginStreak] = useState(5);
  const [scoreRank, setScoreRank] = useState(14); // Out of top 100 businesses

  const { activeId } = useWorkspace();

  useEffect(() => {
    const cachedType = localStorage.getItem('vyron_biz_type');
    if (cachedType) setBizType(cachedType as BusinessType);

    async function checkDbTasks() {
      if (!activeId) return;
      try {
        const supabase = createClient();
        
        // 1. Check transactions
        const { count: txCount } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', activeId)
          .is('deleted_at', null);

        // 2. Check invoices
        const { count: invCount } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', activeId);

        // 3. Check leads
        const { count: leadCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', activeId);

        const updated = DEFAULT_TASKS.map((t) => {
          if (t.id === '1') return { ...t, done: (txCount ?? 0) > 0 };
          if (t.id === '2') return { ...t, done: (invCount ?? 0) > 0 };
          if (t.id === '3') return { ...t, done: (leadCount ?? 0) > 0 };
          return t;
        });

        setTasks(updated);
        localStorage.setItem('vyron_onboarding_tasks', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to fetch onboarding dynamic counts:', err);
      }
    }

    checkDbTasks();
  }, [activeId]);

  const handleSelectBizType = (type: BusinessType) => {
    setBizType(type);
    localStorage.setItem('vyron_biz_type', type);
    toast.success(`Cockpit recalibrated for ${type} operating template!`);
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(updated);
    localStorage.setItem('vyron_onboarding_tasks', JSON.stringify(updated));
    
    const wasChecked = updated.find((t) => t.id === id)?.done;
    if (wasChecked) {
      toast.success('Task marked as completed! Keep going!');
    }
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const activeTemplate = BUSINESS_TEMPLATES[bizType];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Onboarding Tasks Progress Panel */}
      <Card className="md:col-span-2 border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-white/5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-cyan-400" />
                Adaptive Business setup
              </CardTitle>
              <CardDescription className="text-xs">Select your enterprise domain to deploy custom models</CardDescription>
            </div>
            
            {/* Select business template */}
            <select
              value={bizType}
              onChange={(e) => handleSelectBizType(e.target.value as BusinessType)}
              className="bg-zinc-900 border border-white/10 text-[10px] px-2 py-1 rounded-md text-white focus:outline-none cursor-pointer"
            >
              {Object.keys(BUSINESS_TEMPLATES).map((type) => (
                <option key={type} value={type}>
                  {type} Mode
                </option>
              ))}
            </select>
          </div>

          {/* Progress bar */}
          <div className="pt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>Setup Checklist Completion</span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </CardHeader>

        {/* Task lists */}
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-2 text-xs">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                task.done
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-zinc-400'
                  : 'border-white/5 bg-black/40 hover:bg-white/5 text-zinc-200'
              }`}
            >
              {task.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-600 flex-shrink-0" />
              )}
              <span className={task.done ? 'line-through' : 'font-medium'}>{task.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Habit Loops & KPI Metrics Column */}
      <div className="md:col-span-1 space-y-4 flex flex-col justify-between">
        {/* Habit streaks dashboard */}
        <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl flex-1 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-red-400 animate-pulse" />
              Daily Habit Loop
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/40">
              <div className="space-y-0.5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Daily Login Streak</p>
                <p className="text-sm font-extrabold text-white flex items-center gap-1">
                  {loginStreak} Days Active
                </p>
              </div>
              <Flame className="h-6 w-6 text-orange-500" />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/40">
              <div className="space-y-0.5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Productivity Rank</p>
                <p className="text-sm font-extrabold text-cyan-400">
                  #{scoreRank} in India
                </p>
              </div>
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic business recommendation */}
        <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {bizType} Target KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-zinc-400 space-y-2.5">
            <ul className="space-y-1 text-zinc-300 font-mono">
              {activeTemplate.kpis.map((kpi, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <span>{kpi}</span>
                </li>
              ))}
            </ul>
            <p className="border-t border-white/5 pt-2 italic text-[10px]">
              &quot;{activeTemplate.strategy}&quot;
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
