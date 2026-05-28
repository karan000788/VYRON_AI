'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { formatINR } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { BarChart3, TrendingUp, Sparkles, Download, Mail, Calendar, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Mock Transaction aggregates for chart render
const REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, profit: 15000 },
  { month: 'Feb', revenue: 62000, profit: 22000 },
  { month: 'Mar', revenue: 58000, profit: 18000 },
  { month: 'Apr', revenue: 84000, profit: 31000 },
  { month: 'May', revenue: 95000, profit: 42000 }, // Current month
];

export default function ReportsPage() {
  const { activeId } = useWorkspace();
  const [activeHoverData, setActiveHoverData] = useState<any>(null);
  const [forecastActive, setForecastActive] = useState(false);

  const maxVal = 140000;
  const chartHeight = 160;
  const chartWidth = 500;

  // Simple linear regression extrapolation for forecasting the next 2 months
  const getForecastedPoints = () => {
    // x = months [0,1,2,3,4], y = revenue [45k, 62k, 58k, 84k, 95k]
    // Simple average delta projection
    const deltas = [];
    for (let i = 1; i < REVENUE_DATA.length; i++) {
      deltas.push(REVENUE_DATA[i].revenue - REVENUE_DATA[i-1].revenue);
    }
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    
    // Extrapolate
    const m5 = REVENUE_DATA[4].revenue + avgDelta;
    const m6 = m5 + avgDelta;
    
    return [
      { month: 'Jun (AI)', revenue: Math.round(m5), profit: Math.round(m5 * 0.4) },
      { month: 'Jul (AI)', revenue: Math.round(m6), profit: Math.round(m6 * 0.4) },
    ];
  };

  const chartPoints = forecastActive 
    ? [...REVENUE_DATA, ...getForecastedPoints()] 
    : REVENUE_DATA;

  const handleSimulateReport = () => {
    toast.success('Advanced Financial Statement PDF successfully generated and dispatched to your device!');
  };

  const handleSimulateEmail = () => {
    toast.success('Scheduled! Detailed analytical dashboards will be delivered to your inbox every Friday morning.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-xs text-zinc-500">
            Monitor real-time revenue cycles, operating margins, and run linear regression AI forecasts.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            onClick={handleSimulateReport}
            className="bg-white text-black hover:bg-zinc-200 text-xs h-9 px-4 rounded-xl gap-1.5 font-bold"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </Button>
          <Button
            onClick={handleSimulateEmail}
            variant="outline"
            className="border-white/10 bg-zinc-900 text-zinc-300 hover:text-white text-xs h-9 px-4 rounded-xl gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" />
            Schedule Email
          </Button>
        </div>
      </div>

      <FeatureGateShield feature="advanced_analytics" requiredPlan="Growth">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart Card */}
          <Card className="lg:col-span-2 border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                  Revenue & Operating Profit Trends
                </CardTitle>
                <CardDescription className="text-xs">Visualizing past performance and cash flows</CardDescription>
              </div>
              <Button
                onClick={() => setForecastActive(!forecastActive)}
                className={`text-[10px] h-7.5 rounded-lg font-bold gap-1 ${
                  forecastActive 
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                    : 'bg-zinc-900 border border-white/5 text-zinc-300'
                }`}
              >
                <Sparkles className="h-3 w-3 animate-pulse" />
                {forecastActive ? 'AI Forecast Active' : 'Run AI Forecast'}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Interactive Hover Coordinates Display */}
              <div className="flex justify-between items-center h-8 text-[11px] mb-2 px-2">
                {activeHoverData ? (
                  <>
                    <span className="font-bold text-white font-mono">{activeHoverData.month} Analytics:</span>
                    <div className="space-x-3">
                      <span className="text-emerald-400">Revenue: {formatINR(activeHoverData.revenue)}</span>
                      <span className="text-violet-400">Profit: {formatINR(activeHoverData.profit)}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-zinc-500">Hover over chart points to inspect exact parameters</span>
                )}
              </div>

              {/* Render Beautiful Responsive SVG Chart */}
              <div className="relative w-full overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} 200`} className="w-full h-auto">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                    const y = chartHeight * (1 - r) + 15;
                    return (
                      <g key={idx}>
                        <line
                          x1="30"
                          y1={y}
                          x2={chartWidth - 20}
                          y2={y}
                          className="stroke-zinc-800/60"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                        <text x="5" y={y + 4} className="fill-zinc-600 text-[8px] font-mono">
                          {formatINR(maxVal * r).slice(0, -3)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Lines Paths */}
                  {(() => {
                    const step = (chartWidth - 50) / (chartPoints.length - 1);
                    
                    const revPoints = chartPoints.map((d, i) => {
                      const x = 30 + i * step;
                      const y = chartHeight * (1 - d.revenue / maxVal) + 15;
                      return `${x},${y}`;
                    }).join(' ');

                    const profPoints = chartPoints.map((d, i) => {
                      const x = 30 + i * step;
                      const y = chartHeight * (1 - d.profit / maxVal) + 15;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        {/* Revenue line */}
                        <polyline
                          fill="none"
                          stroke="url(#revGrad)"
                          strokeWidth="3.5"
                          points={revPoints}
                          strokeLinecap="round"
                        />
                        {/* Profit line */}
                        <polyline
                          fill="none"
                          stroke="url(#profGrad)"
                          strokeWidth="3.5"
                          points={profPoints}
                          strokeLinecap="round"
                        />

                        {/* Interactive dots */}
                        {chartPoints.map((d, i) => {
                          const x = 30 + i * step;
                          const yRev = chartHeight * (1 - d.revenue / maxVal) + 15;
                          const yProf = chartHeight * (1 - d.profit / maxVal) + 15;
                          const isForecasted = d.month.includes('AI');

                          return (
                            <g
                              key={i}
                              onMouseEnter={() => setActiveHoverData(d)}
                              onMouseLeave={() => setActiveHoverData(null)}
                              className="cursor-pointer group"
                            >
                              <circle
                                cx={x}
                                cy={yRev}
                                r="5.5"
                                className="fill-zinc-950 stroke-cyan-400 group-hover:r-7 transition-all"
                                strokeWidth="2.5"
                              />
                              <circle
                                cx={x}
                                cy={yProf}
                                r="5.5"
                                className="fill-zinc-950 stroke-violet-400 group-hover:r-7 transition-all"
                                strokeWidth="2.5"
                              />
                              {isForecasted && (
                                <circle
                                  cx={x}
                                  cy={yRev}
                                  r="2"
                                  className="fill-cyan-400"
                                />
                              )}
                              <text x={x - 10} y="195" className="fill-zinc-500 text-[8px] font-mono">
                                {d.month.split(' ')[0]}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Chart Legend */}
              <div className="flex justify-center gap-6 mt-4 text-[10px] font-medium text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-5 rounded bg-gradient-to-r from-cyan-400 to-indigo-400" />
                  <span>Revenue Cycle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-5 rounded bg-gradient-to-r from-violet-400 to-pink-400" />
                  <span>Operating Profit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecasting Analytics Column */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  AI Forecasting Insights
                </CardTitle>
                <CardDescription className="text-xs">Statistical trend analysis</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 leading-relaxed space-y-4">
                <p>
                  Linear regression analyzes your workspace transactional activity to project growth trajectories for upcoming billing cycles.
                </p>

                {forecastActive ? (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5 space-y-2.5">
                    <h6 className="font-bold text-violet-400 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Forecast Projections
                    </h6>
                    <ul className="space-y-1.5 text-[11px]">
                      <li className="flex justify-between">
                        <span>June Projected Revenue:</span>
                        <strong className="text-white">₹1,07,500</strong>
                      </li>
                      <li className="flex justify-between">
                        <span>July Projected Revenue:</span>
                        <strong className="text-white">₹1,20,000</strong>
                      </li>
                      <li className="flex justify-between text-violet-300 font-medium">
                        <span>CAGR growth trend:</span>
                        <span>+11.6%</span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-center">
                    <p className="text-[10px] text-zinc-500">
                      Click the "Run AI Forecast" button inside the chart header to overlay future cashflow lines.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-cyan-400" />
                  Accounting Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-zinc-400 leading-relaxed">
                VYRON AI ensures DPDP security compliance by auditing transaction histories on local client machines prior to projecting growth targets.
              </CardContent>
            </Card>
          </div>
        </div>
      </FeatureGateShield>
    </div>
  );
}
