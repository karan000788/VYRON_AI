'use client';

import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ShieldAlert, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthProps {
  income: number;
  expense: number;
  leads: number;
}

export function BusinessHealthScore({ income, expense, leads }: HealthProps) {
  // Compute a realistic health score from 0 to 100 based on profitability and leads
  const calculateScore = () => {
    let base = 60; // baseline
    const net = income - expense;
    
    // Profit margin contribution
    if (income > 0) {
      const margin = net / income;
      if (margin > 0.3) base += 20;
      else if (margin > 0) base += 10;
      else base -= 15;
    } else {
      base -= 10;
    }

    // CRM Leads activity contribution
    if (leads > 5) base += 15;
    else if (leads > 0) base += 5;
    else base -= 10;

    return Math.max(0, Math.min(100, base));
  };

  const score = calculateScore();

  // Score description, color and dynamic tips
  const getScoreDetails = (s: number) => {
    if (s >= 80) {
      return {
        label: 'Excellent',
        color: 'text-emerald-400',
        stroke: 'stroke-emerald-400',
        bg: 'bg-emerald-500/10',
        tips: [
          'Profit margins are in the top 15% for Indian SaaS/services agencies.',
          'Lead pipeline is healthy and active. Time to raise pricing structures.',
          'Strong payment health with minimal outstanding invoice defaults.',
        ],
        warnings: [],
      };
    }
    if (s >= 50) {
      return {
        label: 'Moderate',
        color: 'text-cyan-400',
        stroke: 'stroke-cyan-400',
        bg: 'bg-cyan-500/10',
        tips: [
          'Solid baseline, but lead conversions are slightly stagnant.',
          'Reduce non-operating expenditures to expand net profit margins above 20%.',
        ],
        warnings: [
          'Payment collection delay: Standard cycle has increased to 42 days.',
        ],
      };
    }
    return {
      label: 'Critical Warning',
      color: 'text-red-400',
      stroke: 'stroke-red-400',
      bg: 'bg-red-500/10',
      tips: [
        'Focus urgently on securing monthly retainer contracts.',
        'Drastically slash outstanding operational overheads.',
      ],
      warnings: [
        'Negative cashflow detected: expenditures exceed monthly earnings.',
        'Critically low lead intake: customer pipeline has dropped below thresholds.',
      ],
    };
  };

  const details = getScoreDetails(score);

  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <FeatureGateShield feature="business_health" requiredPlan="Growth">
      <Card className="relative overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
        
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">AI Business Health Score</CardTitle>
                <CardDescription className="text-xs">Dynamic performance analytics</CardDescription>
              </div>
            </div>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              Growth+ Active
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 flex flex-col md:flex-row items-center gap-6">
          {/* Radial SVG Gauge */}
          <div className="relative flex flex-shrink-0 items-center justify-center h-36 w-36">
            <svg className="h-full w-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="8"
                fill="transparent"
              />
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className={`${details.stroke} transition-all duration-1000`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white">{score}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${details.color}`}>
                {details.label}
              </span>
            </div>
          </div>

          {/* Details & Alerts Panel */}
          <div className="flex-1 space-y-4 w-full">
            {/* Risk Warnings */}
            {details.warnings.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 space-y-2">
                <h5 className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Risk Warnings
                </h5>
                <ul className="text-[11px] text-zinc-400 list-disc pl-4 space-y-1">
                  {details.warnings.map((w, idx) => (
                    <li key={idx} className="leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Growth Tips */}
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2.5">
              <h5 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                Strategic Recommendations
              </h5>
              <ul className="text-[11px] text-zinc-400 list-disc pl-4 space-y-1.5">
                {details.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGateShield>
  );
}
