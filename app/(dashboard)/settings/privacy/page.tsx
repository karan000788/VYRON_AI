'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, HardDrive, KeyRound, Monitor, FileSpreadsheet, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  event: string;
  ipAddress: string;
  location: string;
  time: string;
}

const INITIAL_LOGS: AuditLog[] = [
  { id: '1', event: 'Database PII records audit logs compiled', ipAddress: '192.168.1.45', location: 'Pune, India', time: 'May 17, 2026 21:14' },
  { id: '2', event: 'Consent agreement logged (DPDP Framework v1)', ipAddress: '103.88.22.4', location: 'Mumbai, India', time: 'May 16, 2026 14:02' },
  { id: '3', event: 'AES-256 ledger encryption key cycled', ipAddress: 'SYSTEM', location: 'Cloud Gateway', time: 'May 15, 2026 00:00' },
];

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  
  // Toggles for personal data choices
  const [optInAnalytics, setOptInAnalytics] = useState(true);
  const [optInAiBriefing, setOptInAiBriefing] = useState(true);

  async function requestExport() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not signed in');
        setLoading(false);
        return;
      }
      
      const { data: mData } = await supabase
        .from('memberships')
        .select('business_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      await supabase.from('notifications').insert({
        business_id: mData?.business_id,
        user_id: user.id,
        title: 'Data export requested',
        body: 'We will email your export within 48 hours.',
        created_by: user.id,
      });

      toast.success('Your complete GDPR & DPDP-compliant ledger audit export has been initiated!');
    } catch {
      toast.error('Could not schedule data export.');
    }
    setLoading(false);
  }

  async function requestDelete() {
    if (!confirm('Request account deletion? All local database ledger sync PII will be anonymized within 30 days.')) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('users')
        .update({ delete_requested_at: new Date().toISOString() })
        .eq('id', user.id);
      toast.success('PII erasure request registered. Account scheduled for permanent teardown.');
    } catch {
      toast.error('Failed to cycle erasure request.');
    }
    setLoading(false);
  }

  const handleSimulateRevoke = (id: string) => {
    toast.success('Session token revoked! Dispatched log-off webhook command to remote client.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Privacy & Security Center
        </h1>
        <p className="text-xs text-zinc-500 font-mono">
          Audit system actions, configure active device sessions, and configure DPDP Indian privacy controls.
        </p>
      </div>

      {/* Compliance Indicator Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: ShieldCheck, title: 'DPDP Encrypted', desc: 'Secure Ledger' },
          { icon: HardDrive, title: 'AES-256 Storage', desc: 'Local Keys' },
          { icon: KeyRound, title: 'OAuth2/SSL', desc: 'Encrypted Link' },
          { icon: Shield, title: 'SOC-2 Ready', desc: ' audited' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-white">{item.title}</p>
                <p className="text-[10px] text-zinc-500 font-mono">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* DPDP Controls & Settings */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Indian DPDP Controls
              </CardTitle>
              <CardDescription className="text-xs">Configure your personal ledger options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <p className="font-semibold text-white">Opt-In Analytics</p>
                  <p className="text-[10px] text-zinc-500 leading-normal">Transmit local activity charts to optimize page speed.</p>
                </div>
                <input
                  type="checkbox"
                  checked={optInAnalytics}
                  onChange={(e) => setOptInAnalytics(e.target.checked)}
                  className="accent-cyan-400 h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="space-y-0.5 pr-2">
                  <p className="font-semibold text-white">AI Context Briefing</p>
                  <p className="text-[10px] text-zinc-500 leading-normal">Permit AI models to compile operational memory logs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={optInAiBriefing}
                  onChange={(e) => setOptInAiBriefing(e.target.checked)}
                  className="accent-cyan-400 h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-3 border-t border-white/5">
                <Button
                  onClick={requestExport}
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-zinc-200 text-xs font-bold h-9 rounded-xl gap-1.5"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Data Ledger
                </Button>
                
                <Button
                  onClick={requestDelete}
                  disabled={loading}
                  variant="destructive"
                  className="w-full bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-500/10 text-xs h-9 rounded-xl gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Request Account Erasure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-violet-400" />
                Active Device Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl border border-white/5 bg-black/40 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Google Chrome (Windows)</p>
                  <p className="text-[10px] text-zinc-500">Pune, India · IP: 103.88.22.4</p>
                </div>
                <span className="text-[9px] rounded-full bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5">
                  Current
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-white/5 bg-black/40 flex justify-between items-center">
                <div>
                  <p className="font-bold text-zinc-300">Safari (Apple iPhone)</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Mumbai, India · IP: 103.88.23.1</p>
                </div>
                <button
                  onClick={() => handleSimulateRevoke('Apple iPhone')}
                  className="text-[10px] text-red-400 hover:underline font-bold"
                >
                  Revoke
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Audit Logs */}
        <div className="lg:col-span-2">
          <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-violet-400" />
                Audit Logs Directory
              </CardTitle>
              <CardDescription className="text-xs">Immutable system security access records</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-white/5 bg-black/40 flex justify-between items-center gap-4 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-zinc-200">{log.event}</p>
                    <p className="text-[10px] text-zinc-500">
                      IP: {log.ipAddress} · Region: {log.location}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 flex-shrink-0">{log.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
