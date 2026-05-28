'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Users, Plus, Target, Sparkles, Clock, Copy, Send, Trash, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

async function fetchLeads(businessId: string): Promise<Lead[]> {
  const { data, error } = await createClient()
    .from('leads')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export default function LeadsPage() {
  const { activeId } = useWorkspace();
  const { data, isLoading } = useSWR(
    activeId ? ['leads', activeId] : null,
    () => fetchLeads(activeId!)
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [leadTitle, setLeadTitle] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const [leadSource, setLeadSource] = useState('Google Search');
  const [leadStatus, setLeadStatus] = useState<'new' | 'contacted' | 'qualified' | 'proposal' | 'won'>('new');
  const [error, setError] = useState<string | null>(null);
  
  // Scoring / Follow up states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draftResult, setDraftResult] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadTitle.trim() || !leadValue) {
      toast.error('Add lead title and estimated deal value.');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('leads')
        .insert({
          business_id: activeId!,
          title: leadTitle.trim(),
          status: leadStatus,
          source: leadSource,
          value_inr: Number(leadValue),
        });

      if (error) throw error;

      mutate(['leads', activeId]);
      setShowCreateModal(false);
      
      setLeadTitle('');
      setLeadValue('');
      setLeadStatus('new');
      toast.success('CRM Lead added to pipeline successfully!');
    } catch (err) {
      toast.error('Failed to add lead to CRM.');
    }
  };

  const getLeadScore = (lead: Lead) => {
    const val = Number(lead.value_inr || 0);
    const status = lead.status;

    if (status === 'won' || status === 'proposal') {
      return { label: 'Hot', color: 'text-red-400 border-red-500/20 bg-red-500/5', rate: '85%', time: 'Immediate (within 2h)' };
    }
    if (status === 'qualified' || status === 'contacted' || val > 100000) {
      return { label: 'Warm', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', rate: '55%', time: 'Daily briefing (within 12h)' };
    }
    return { label: 'Cold', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5', rate: '25%', time: 'Weekly trigger (within 48h)' };
  };

  const generateDraft = async (lead: Lead) => {
    setDrafting(true);
    setDraftResult(null);
    try {
      const controller = new AbortController();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Write a hyper-focused WhatsApp reach out message for client lead: "${lead.title}". Deal value: ${formatINR(Number(lead.value_inr))}. Goal: Book a calendar demonstration. Keep it short and high converting.`,
            },
          ],
          taskType: 'lead_scoring',
        }),
        signal: controller.signal,
      });

      setDrafting(false);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI error');
      setDraftResult(data.text || data.content);
      toast.success('Custom follow-up draft created!');
    } catch (err: any) {
      setDrafting(false);
      setError(err.message || 'Draft generation failed.');
      toast.error('Draft generation failed.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('leads').delete().eq('id', id);
      mutate(['leads', activeId]);
      if (selectedLead?.id === id) {
        setSelectedLead(null);
        setDraftResult(null);
      }
      toast.success('Lead removed from CRM.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <>
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Leads CRM
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Pipeline overview, AI lead scoring parameters, and follow-up campaign generators.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-black hover:bg-zinc-200 rounded-xl text-xs px-4 h-9 gap-1.5 font-bold self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* CRM Pipeline List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-violet-400" />
                  Active Sales Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading && <Skeleton className="h-40 w-full rounded-xl" />}
                {!isLoading && !data?.length ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
                    Pipeline empty. Click "Add Lead" to register prospective deals.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data?.map((lead) => {
                      const score = getLeadScore(lead);
                      const isPicked = selectedLead?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setDraftResult(null);
                          }}
                          className={`flex justify-between items-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isPicked 
                              ? 'border-violet-500/40 bg-violet-500/10' 
                              : 'border-white/5 bg-black/40 hover:bg-white/5'
                          }`}
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-xs text-white">{lead.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 flex-wrap">
                              <span className="capitalize">{lead.status}</span>
                              <span>·</span>
                              <span>{lead.source || 'Direct'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3.5">
                            {lead.value_inr != null && (
                              <span className="text-xs font-bold text-cyan-400">{formatINR(Number(lead.value_inr))}</span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${score.color}`}>
                              {score.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead.id);
                              }}
                              className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Scoring Panel */}
          <div className="lg:col-span-1">
            <FeatureGateShield feature="lead_scoring" requiredPlan="Growth">
              <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full flex flex-col min-h-[400px]">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-cyan-400" />
                    AI CRM Scoring Index
                  </CardTitle>
                  <CardDescription className="text-xs">Identify high value leads and follow up timings</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-6 flex flex-col justify-center">
                  {selectedLead ? (
                    <div className="flex-1 flex flex-col space-y-5 text-xs">
                      {/* Lead Score Cards */}
                      {(() => {
                        const score = getLeadScore(selectedLead);
                        return (
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-0.5 text-center">
                              <span className="text-[10px] text-zinc-500 uppercase">Probability</span>
                              <p className="text-base font-extrabold text-white">{score.rate}</p>
                            </div>
                            <div className="rounded-xl border border-white/5 bg-white/5 p-3 space-y-0.5 text-center">
                              <span className="text-[10px] text-zinc-500 uppercase font-mono">Heat Scale</span>
                              <p className="text-base font-extrabold text-cyan-400">{score.label}</p>
                            </div>
                            
                            <div className="col-span-2 rounded-xl border border-white/5 bg-black/40 p-3 flex items-start gap-2.5">
                              <Clock className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-zinc-500 uppercase">Optimal Follow Up Time</span>
                                <p className="text-xs font-semibold text-zinc-200">{score.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* AI Draft Section */}
                      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h6 className="font-bold text-cyan-400 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Follow Up Assistant
                          </h6>
                          
                          {drafting ? (
                            <div className="flex items-center gap-1.5 py-4 justify-center">
                              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : draftResult ? (
                            <p className="text-[11px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap max-h-[180px] overflow-y-auto bg-black/40 p-2.5 rounded border border-white/5">
                              {draftResult}
                            </p>
                          ) : (
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Generate a highly converting follow up message specifically optimized for this deal.
                            </p>
                          )}
                        </div>

                        {!drafting && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => generateDraft(selectedLead)}
                              className="bg-white text-black hover:bg-zinc-200 flex-1 text-[10px] h-8 font-bold"
                            >
                              {draftResult ? 'Regenerate Draft' : 'Create Draft'}
                            </Button>
                            {draftResult && (
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(draftResult);
                                  toast.success('Draft copied!');
                                }}
                                variant="outline"
                                className="border-white/10 bg-zinc-900 text-zinc-300 hover:text-white text-[10px] h-8"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-zinc-500 py-16 space-y-2">
                      <Target className="h-10 w-10 text-zinc-700 animate-pulse" />
                      <h6 className="text-xs font-bold text-zinc-400">No Lead Selected</h6>
                      <p className="text-[10px] max-w-sm">
                        Select a lead from your sales pipeline on the left to activate AI CRM parameters and conversion follow ups.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FeatureGateShield>
          </div>
        </div>

        {/* Create Lead Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-cyan-400" />
                    Add CRM Lead
                  </h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white text-xs">
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-500">Lead Title / Client Name</label>
                    <Input
                      required
                      value={leadTitle}
                      onChange={(e) => setLeadTitle(e.target.value)}
                      placeholder="e.g. Karan gaming store retainer"
                      className="bg-zinc-900 border-white/10 h-8.5 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500">Estimated Deal Value (INR)</label>
                    <Input
                      required
                      type="number"
                      value={leadValue}
                      onChange={(e) => setLeadValue(e.target.value)}
                      placeholder="e.g. 75000"
                      className="bg-zinc-900 border-white/10 h-8.5 text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-zinc-500">Lead Source</label>
                      <select
                        value={leadSource}
                        onChange={(e) => setLeadSource(e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 h-8.5 focus:outline-none"
                      >
                        <option value="Google Search">Google Search</option>
                        <option value="LinkedIn Promo">LinkedIn</option>
                        <option value="WhatsApp Campaign">WhatsApp Ad</option>
                        <option value="Direct Cold Outreach">Cold outreach</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500">Pipeline Status</label>
                      <select
                        value={leadStatus}
                        onChange={(e) => setLeadStatus(e.target.value as any)}
                        className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 h-8.5 focus:outline-none"
                      >
                        <option value="new">New Opportunity</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal Sent</option>
                        <option value="won">Won Deal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-xl text-xs h-8.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold rounded-xl text-xs h-8.5 px-4"
                    >
                      Add Lead to CRM
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
