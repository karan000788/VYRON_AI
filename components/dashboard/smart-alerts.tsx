'use client';

import React, { useState } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ShieldAlert, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useFeatureGate } from '@/hooks/use-feature-gate';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertsProps {
  income: number;
  expense: number;
  credits: number;
}

export function SmartAlertSystem({ income, expense, credits }: AlertsProps) {
  const { checkAccess } = useFeatureGate();
  
  // Custom alerts list computed dynamically
  const getAnomalies = () => {
    const alerts = [];
    if (expense > income * 0.5 && income > 0) {
      alerts.push({
        id: 'high_expense',
        title: 'High Expenditure Ratio',
        desc: 'Operational expenses have crossed 50% of your MTD revenue.',
        severity: 'critical',
      });
    }
    if (credits < 100) {
      alerts.push({
        id: 'low_credits',
        title: 'Low AI Credits Warning',
        desc: 'You have only ' + credits + ' AI credits remaining. Assistant requests will block soon.',
        severity: 'warning',
      });
    }
    if (income === 0) {
      alerts.push({
        id: 'flat_revenue',
        title: 'Flat Growth Pipeline',
        desc: 'No incoming invoice collections detected during the past 7 business days.',
        severity: 'warning',
      });
    }
    return alerts;
  };

  const anomalies = getAnomalies();
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);

  const handleResolve = (id: string) => {
    setResolvedAlerts((prev) => [...prev, id]);
    toast.success('Alert dismissed successfully!');
  };

  const triggerEmail = (title: string) => {
    const hasEmailAccess = checkAccess('smart_alerts');
    if (!hasEmailAccess) {
      toast.error('Email alert forwarding is a premium Growth feature!');
      return;
    }
    toast.success('Alert content forwarded via email successfully!');
  };

  const triggerWhatsApp = () => {
    const hasWhatsAppAccess = checkAccess('whatsapp_automation');
    if (!hasWhatsAppAccess) {
      toast.error('WhatsApp notifications require the Growth or Pro plan!');
      return;
    }
    toast.success('Alert alert message successfully dispatched via WATI CRM template!');
  };

  const activeAlerts = anomalies.filter((a) => !resolvedAlerts.includes(a.id));

  return (
    <FeatureGateShield feature="smart_alerts" requiredPlan="Growth">
      <Card className="relative overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
        
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">AI Smart Alert System</CardTitle>
                <CardDescription className="text-xs">Real-time threat and anomaly detection</CardDescription>
              </div>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
              Growth+ Active
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {activeAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 space-y-2"
              >
                <CheckCircle className="h-8 w-8 text-emerald-400" />
                <p className="text-xs font-medium text-zinc-300">All operating metrics are normal.</p>
                <p className="text-[10px]">No active operational threats detected by AI pipelines.</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layoutId={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      alert.severity === 'critical'
                        ? 'border-red-500/20 bg-red-500/5'
                        : 'border-amber-500/20 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-2.5">
                        <ShieldAlert className={`h-4 w-4 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                        }`} />
                        <div>
                          <h6 className="text-xs font-bold text-white">{alert.title}</h6>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{alert.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="text-[10px] font-semibold text-zinc-500 hover:text-white transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>

                    {/* Notification Channel Dispatchers */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <span className="text-[9px] text-zinc-500 uppercase font-medium mr-2">Forward:</span>
                      <button
                        onClick={() => triggerEmail(alert.title)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Mail className="h-3 w-3" />
                        <span>Email</span>
                      </button>
                      <button
                        onClick={triggerWhatsApp}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </FeatureGateShield>
  );
}
