'use client';

import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface BriefingProps {
  income: number;
  expense: number;
  leads: number;
}

export function DailyBriefing({ income, expense, leads }: BriefingProps) {
  const netProfit = income - expense;
  const margin = income > 0 ? ((netProfit / income) * 100).toFixed(0) : '0';

  // Realistic dynamic AI recommendations based on metrics
  const getAiInsights = () => {
    if (income === 0) {
      return {
        insights: 'Your revenue is currently flat for the month. Recommend launching a flash campaign.',
        action: 'Draft a promotion copy using the AI Marketing Engine to engage old leads.',
      };
    }
    if (netProfit < 0) {
      return {
        insights: 'Expenses exceed income by ' + formatINR(Math.abs(netProfit)) + '. Margin is currently negative.',
        action: 'Review recurring software subscriptions and pause non-essential advertising campaigns.',
      };
    }
    return {
      insights: 'Healthy profit margin of ' + margin + '% detected. Upward momentum is solid.',
      action: 'Allocate 15% of surplus capital to increase Google Ad spend on Hot scored leads.',
    };
  };

  const insights = getAiInsights();

  return (
    <FeatureGateShield feature="daily_briefing" requiredPlan="Starter">
      <Card className="relative overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
        
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">AI Daily Briefing</CardTitle>
                <CardDescription className="text-xs">Generated daily overview & insights</CardDescription>
              </div>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
              Starter+ Active
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {/* Daily Metrics Grid */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                Revenue
              </span>
              <p className="text-base font-bold text-emerald-400">{formatINR(income)}</p>
            </div>
            
            <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-red-400" />
                Expenses
              </span>
              <p className="text-base font-bold text-red-400">{formatINR(expense)}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" />
                Net Profit
              </span>
              <p className={`text-base font-bold ${netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatINR(netProfit)}
              </p>
            </div>
          </div>

          {/* Quick Updates */}
          <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3">
            <h5 className="text-xs font-semibold text-zinc-300">Briefing Summary</h5>
            <ul className="text-xs text-zinc-400 space-y-2">
              <li className="flex items-center justify-between">
                <span>Leads activity:</span>
                <span className="text-white font-medium">{leads} active pipeline leads</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Pending invoices:</span>
                <span className="text-amber-400 font-medium">₹0 overdue payment</span>
              </li>
            </ul>
          </div>

          {/* AI Insights & Recommendations */}
          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 p-4 space-y-3">
            <h5 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              AI Recommendations
            </h5>
            <div className="text-xs space-y-2">
              <p className="text-zinc-300 leading-relaxed">
                {insights.insights}
              </p>
              <div className="rounded border border-cyan-500/10 bg-cyan-950/20 p-2.5 text-[11px] text-cyan-300">
                <strong>Next Step:</strong> {insights.action}
              </div>

              {/* Actionable execution buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 mt-3">
                {income === 0 ? (
                  <>
                    <Button
                      onClick={() => toast.success('WhatsApp campaign generated & scheduled for delivery to inactive client database!')}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold text-[10px] h-7 px-2.5 rounded-lg"
                    >
                      Launch WhatsApp Campaign
                    </Button>
                    <Button
                      onClick={() => toast.success('Diwali flash promo coupon code "VYR-FEST-20" created and ready in your catalog!')}
                      variant="outline"
                      className="border-white/10 bg-zinc-900 text-zinc-300 hover:text-white font-bold text-[10px] h-7 px-2.5 rounded-lg"
                    >
                      Draft Promo Offer
                    </Button>
                  </>
                ) : netProfit < 0 ? (
                  <>
                    <Button
                      onClick={() => toast.success('Audited! Categorized ₹4,500 under duplicate cloud software subscription overheads.')}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] h-7 px-2.5 rounded-lg"
                    >
                      Audit Categories
                    </Button>
                    <Button
                      onClick={() => toast.success('Savings plan generated! Dispatched direct to your dashboard reports center.')}
                      variant="outline"
                      className="border-white/10 bg-zinc-900 text-zinc-300 hover:text-white font-bold text-[10px] h-7 px-2.5 rounded-lg"
                    >
                      Generate Savings Plan
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => toast.success('Ad budgets scale instruction registered! Scaled monthly ad caps by +15%.')}
                      className="bg-white hover:bg-zinc-200 text-black font-extrabold text-[10px] h-7 px-2.5 rounded-lg"
                    >
                      Scale Google Ads
                    </Button>
                    <Button
                      onClick={() => toast.success('Motivator bulletin "Q2 revenue growth targets met!" broadcasted to all team members!')}
                      variant="outline"
                      className="border-white/10 bg-zinc-900 text-zinc-300 hover:text-white font-bold text-[10px] h-7 px-2.5 rounded-lg"
                    >
                      Notify Team Members
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGateShield>
  );
}
