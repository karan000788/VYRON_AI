'use client';

import React, { useState } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageSquare, Settings2, Plus, Sparkles, Send, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  category: string;
  body: string;
  status: 'Approved' | 'Pending Approval';
}

const INITIAL_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'payment_reminder_in',
    category: 'Billing & Invoices',
    body: 'Namaste {{1}}, your invoice {{2}} of amount {{3}} is now ready for collection. Click here to securely pay via Razorpay: {{4}}',
    status: 'Approved',
  },
  {
    id: '2',
    name: 'lead_follow_up_in',
    category: 'CRM & Marketing',
    body: 'Hello {{1}}, thank you for choosing VYRON AI. We noticed your interest in our business services. Are you free for a swift call at {{2}}?',
    status: 'Approved',
  },
  {
    id: '3',
    name: 'festival_greeting_in',
    category: 'Marketing',
    body: 'Wishing you a highly prosperous Diwali! 🪔 As a valued customer of {{1}}, enjoy an exclusive {{2}}% discount using code {{3}} this week!',
    status: 'Pending Approval',
  },
];

export default function WhatsAppSettingsPage() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [watiConnected, setWatiConnected] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Template form state
  const [tempName, setTempName] = useState('');
  const [tempCategory, setTempCategory] = useState('Billing & Invoices');
  const [tempBody, setTempBody] = useState('');

  const handleConnectWati = () => {
    setWatiConnected(!watiConnected);
    if (!watiConnected) {
      toast.success('Successfully connected to WATI WhatsApp Business API Gateway!');
    } else {
      toast.success('WATI integration disconnected.');
    }
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim() || !tempBody.trim()) {
      toast.error('Fill in all template fields.');
      return;
    }

    const newTemp: Template = {
      id: crypto.randomUUID(),
      name: tempName.trim().toLowerCase().replace(/\s+/g, '_'),
      category: tempCategory,
      body: tempBody.trim(),
      status: 'Pending Approval',
    };

    setTemplates([newTemp, ...templates]);
    setTempName('');
    setTempBody('');
    setShowAddForm(false);
    toast.success('Template submitted to WATI for approval successfully!');
  };

  const handleSimulateTest = (name: string) => {
    if (!watiConnected) {
      toast.error('Connect your WATI API first before triggering templates.');
      return;
    }
    toast.success(`Mock test message for template "${name}" sent to +91 99999 99999!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          WhatsApp Automation
        </h1>
        <p className="text-xs text-zinc-500">
          Sync WATI gateways, configure active invoice payment reminders, and dispatch marketing campaigns.
        </p>
      </div>

      <FeatureGateShield feature="whatsapp_automation" requiredPlan="Growth">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Connection Settings Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Settings2 className="h-4 w-4 text-cyan-400" />
                  WATI API Integration
                </CardTitle>
                <CardDescription className="text-xs">Connect your official WhatsApp API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-xs">
                  <label className="text-zinc-400">WATI API Endpoint</label>
                  <Input
                    placeholder="https://live-server.wati.io/api/v1"
                    disabled={watiConnected}
                    className="bg-zinc-900 border-white/10 text-xs h-9"
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <label className="text-zinc-400">Auth Access Token</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    disabled={watiConnected}
                    className="bg-zinc-900 border-white/10 text-xs h-9"
                  />
                </div>
                
                <Button
                  onClick={handleConnectWati}
                  className={`w-full text-xs h-9 font-bold rounded-xl gap-1.5 ${
                    watiConnected 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {watiConnected ? (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      WATI Connected
                    </>
                  ) : (
                    'Connect WATI'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  AI Campaign Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 leading-relaxed space-y-2.5">
                <p>
                  Enable smart reminders to automatically follow up on unpaid invoices or cold scored leads via WhatsApp.
                </p>
                <div className="rounded border border-violet-500/10 bg-violet-950/20 p-2.5 text-[10px] text-violet-300">
                  <strong>Growth Plan Advantage:</strong> Supports 2,000 WATI API automated triggers per month.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Directory */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-violet-400" />
                    WATI WhatsApp Templates
                  </CardTitle>
                  <CardDescription className="text-xs">Pre-approved template configurations</CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-white text-black hover:bg-zinc-200 rounded-xl text-xs px-3 h-8 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Template
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddTemplate}
                      className="border border-white/10 rounded-xl bg-white/5 p-4 mb-6 space-y-3.5 text-xs overflow-hidden"
                    >
                      <h5 className="font-bold text-white">Create New Template</h5>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-zinc-400">Template Name</label>
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="e.g. payment_reminder_quick"
                            className="bg-zinc-900 border-white/5 text-xs h-8.5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-400">Category</label>
                          <select
                            value={tempCategory}
                            onChange={(e) => setTempCategory(e.target.value)}
                            className="w-full rounded-md border border-white/5 bg-zinc-900 text-xs px-2.5 h-8.5 focus:outline-none"
                          >
                            <option value="Billing & Invoices">Billing & Invoices</option>
                            <option value="CRM & Marketing">CRM & Marketing</option>
                            <option value="Marketing">Marketing</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-400">Body Text (use {"{{1}}"}, {"{{2}}"} for variables)</label>
                        <textarea
                          value={tempBody}
                          onChange={(e) => setTempBody(e.target.value)}
                          placeholder="Namaste {{1}}, thank you for paying {{2}}..."
                          className="w-full rounded-md border border-white/5 bg-zinc-900 px-3 py-2 text-xs min-h-[80px] focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowAddForm(false)}
                          className="text-xs h-8.5 rounded-lg"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-xs h-8.5 rounded-lg"
                        >
                          Submit Approval
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="border border-white/5 rounded-xl bg-black/40 p-4 flex flex-col sm:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h6 className="text-xs font-bold text-white font-mono">{t.name}</h6>
                          <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] text-zinc-400 font-medium">
                            {t.category}
                          </span>
                          <span className={`rounded px-2 py-0.5 text-[9px] font-bold ${
                            t.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">
                          {t.body}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex items-center justify-end sm:self-center">
                        <Button
                          onClick={() => handleSimulateTest(t.name)}
                          className="bg-zinc-900 border border-white/5 text-zinc-300 hover:bg-zinc-800 text-[10px] h-8.5 rounded-lg gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </FeatureGateShield>
    </div>
  );
}
