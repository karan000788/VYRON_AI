'use client';

import React, { useState } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Play, ArrowRight, Plus, ToggleLeft, ToggleRight, Sparkles, AlertCircle, Trash, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
}

const INITIAL_RULES: AutomationRule[] = [
  {
    id: 'r1',
    name: 'Auto-ping Overdue Invoice via WhatsApp',
    trigger: 'Invoice Overdue by 2 days',
    action: 'Send WATI WhatsApp template',
    active: true,
  },
  {
    id: 'r2',
    name: 'Low Weekly Sales Alarm',
    trigger: 'Revenue drops by 15%',
    action: 'Generate campaign copy & notify owner',
    active: true,
  },
  {
    id: 'r3',
    name: 'Stale CRM Lead Follow-up',
    trigger: 'Lead inactive for 72 hours',
    action: 'Create calendar follow-up draft',
    active: false,
  },
];

const TRIGGERS = [
  'Invoice Overdue',
  'Lead Inactive',
  'Low Sales drop',
  'Payment Failed',
  'High Expenses overflow',
  'Customer Inactivity',
];

const ACTIONS = [
  'Send WhatsApp message',
  'Send email receipt',
  'Generate campaign copy',
  'Notify owner dashboard',
  'Create task reminder',
  'Generate monthly report',
];

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  
  // Custom Flow Builder state
  const [flowName, setFlowName] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState(TRIGGERS[0]);
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowName.trim()) {
      toast.error('Specify an engaging name for your workflow automation.');
      return;
    }

    const newRule: AutomationRule = {
      id: crypto.randomUUID(),
      name: flowName.trim(),
      trigger: selectedTrigger,
      action: selectedAction,
      active: true,
    };

    setRules([...rules, newRule]);
    setFlowName('');
    toast.success(`Workflow "${newRule.name}" successfully deployed and active!`);
  };

  const handleToggle = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    toast.success('Automation state toggled.');
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    toast.success('Automation recipe deleted.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Business Automation Engine
        </h1>
        <p className="text-xs text-zinc-500">
          Formulate Zapier/Notion-style workflows connecting database triggers to WhatsApp, Email, or AI operations.
        </p>
      </div>

      <FeatureGateShield feature="whatsapp_automation" requiredPlan="Growth">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Visual Canvas Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Settings2 className="h-4 w-4 text-cyan-400" />
                  Visual Node Canvas
                </CardTitle>
                <CardDescription className="text-xs">Drag or select custom recipes to deploy active loops</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Visual Flow Representation */}
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-6 flex flex-col sm:flex-row items-center justify-around gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                  
                  {/* Trigger Node */}
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-center w-48 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                    <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">IF TRIGGER</span>
                    <p className="text-xs font-bold text-white mt-1 capitalize">{selectedTrigger}</p>
                  </div>

                  {/* Flow Connection Arrow */}
                  <div className="flex items-center gap-1 text-zinc-600 animate-pulse">
                    <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                  </div>

                  {/* Action Node */}
                  <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-4 text-center w-48 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
                    <span className="text-[10px] text-violet-400 font-mono font-bold uppercase tracking-wider block">THEN EXECUTE</span>
                    <p className="text-xs font-bold text-white mt-1 capitalize">{selectedAction}</p>
                  </div>
                </div>

                {/* Form Builders */}
                <form onSubmit={handleAddRule} className="grid gap-4 sm:grid-cols-3 items-end text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-500">Trigger Event</label>
                    <select
                      value={selectedTrigger}
                      onChange={(e) => setSelectedTrigger(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 h-9 focus:outline-none"
                    >
                      {TRIGGERS.map((t, idx) => (
                        <option key={idx} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500">Action Output</label>
                    <select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 h-9 focus:outline-none"
                    >
                      {ACTIONS.map((a, idx) => (
                        <option key={idx} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 font-mono">Workflow Name</label>
                    <Input
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      placeholder="e.g. Notify late fees on WhatsApp"
                      className="bg-zinc-900 border-white/10 h-9 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-xs h-9 rounded-xl gap-1">
                      <Plus className="h-4 w-4" />
                      Deploy Custom Automation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Active Workflows sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Play className="h-4 w-4 text-violet-400" />
                  Deployed Workflows
                </CardTitle>
                <CardDescription className="text-xs">Active triggers & automation logs</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3.5">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="border border-white/5 rounded-xl bg-black/40 p-3.5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white leading-normal">{rule.name}</p>
                        <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                          IF: {rule.trigger}
                        </p>
                        <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                          THEN: {rule.action}
                        </p>
                      </div>
                      <span className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold ${
                        rule.active 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {rule.active ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-3 justify-between h-full">
                      <button onClick={() => handleToggle(rule.id)} className="focus:outline-none">
                        {rule.active ? (
                          <ToggleRight className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-zinc-600" />
                        )}
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="text-zinc-600 hover:text-red-400">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </FeatureGateShield>
    </div>
  );
}
