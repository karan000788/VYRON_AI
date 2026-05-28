'use client';

import React from 'react';
import { CopilotChat } from '@/components/ai/copilot-chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, AlertCircle, Sparkles, Send, HelpCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPage() {
  const handleSimulateAlertAction = (actionName: string) => {
    toast.success(`Action "${actionName}" executed successfully! Alert resolved.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          AI Operations Center
        </h1>
        <p className="text-xs text-zinc-500">
          Unify voice prompts, inspect context-compressed operational summaries, and execute automated workflow triggers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Interactive Copilot Chat Box */}
        <div className="lg:col-span-2 h-[calc(100vh-14rem)] min-h-[500px]">
          <CopilotChat />
        </div>

        {/* Right Column: AI Operations & Memory center */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
          {/* AI Memory & Preferences Index */}
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-violet-400" />
                AI Memory & Context
              </CardTitle>
              <CardDescription className="text-[10px]">Recurring patterns & business preferences</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-[11px] text-zinc-400 space-y-3 font-mono">
              <div className="space-y-1 rounded-lg border border-white/5 bg-black/40 p-2.5">
                <p className="font-bold text-white text-[10px]">Client Payment Cycles</p>
                <p className="leading-relaxed">Karan Gaming Store settles GST invoices on Fridays. WhatsApp reminder buffer active for Thursdays.</p>
              </div>

              <div className="space-y-1 rounded-lg border border-white/5 bg-black/40 p-2.5">
                <p className="font-bold text-white text-[10px]">Seasonal Promos</p>
                <p className="leading-relaxed">Creative festival discount templates achieve maximum conversions during lean operational hours (10 AM).</p>
              </div>

              <div className="space-y-1 rounded-lg border border-white/5 bg-black/40 p-2.5">
                <p className="font-bold text-white text-[10px]">Onboarding KPI Mode</p>
                <p className="leading-relaxed">Active template calibrated to Freelancer hourly metrics and student 35% discount tiers.</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Detections & Quick Automations */}
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-cyan-400" />
                Real-Time Risk Mitigations
              </CardTitle>
              <CardDescription className="text-[10px]">Actionable execution suggestions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {/* Alert 1 */}
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2.5">
                <div className="space-y-0.5">
                  <h6 className="font-bold text-white text-[11px]">Unpaid Balance Overdue</h6>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Vyron Tech Pvt Ltd has a pending CGST bill of ₹29,500 overdue by 4 days.
                  </p>
                </div>
                <Button
                  onClick={() => handleSimulateAlertAction('Send WhatsApp Invoice Share')}
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[9px] h-6 px-2.5 rounded-lg w-full flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Send WhatsApp Reminder
                </Button>
              </div>

              {/* Alert 2 */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2.5">
                <div className="space-y-0.5">
                  <h6 className="font-bold text-white text-[11px]">Inactive Hot CRM Lead</h6>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Lead &quot;Karan gaming store retainer&quot; has been cold for over 72 hours.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText('Namaste Karan, we prepared your gaming store discount invoice drafts! Let us know when to schedule our calendar demo!');
                    toast.success('Custom follow-up draft copied to clipboard!');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[9px] h-6 px-2.5 rounded-lg w-full flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate Follow-Up Script
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
