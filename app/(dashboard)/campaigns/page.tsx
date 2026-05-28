'use client';

import React, { useState } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Megaphone, Plus, Send, MessageSquare, Mail, Sparkles, RefreshCw,
  CheckCircle, Clock, XCircle, BarChart2, Users, Eye, MousePointerClick, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
type CampaignChannel = 'whatsapp' | 'email';

interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  createdAt: string;
  body: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Diwali Festival Promo 2026',
    channel: 'whatsapp',
    status: 'sent',
    audience: 'All Customers',
    sent: 248,
    opened: 211,
    clicked: 87,
    createdAt: 'May 12, 2026',
    body: 'Wishing you a glowing Diwali! 🪔 Enjoy 20% off on all plans this week. Use code DIWALI20 at checkout.',
  },
  {
    id: 'c2',
    name: 'Monthly Growth Newsletter',
    channel: 'email',
    status: 'sent',
    audience: 'Pro & Growth Subscribers',
    sent: 134,
    opened: 98,
    clicked: 42,
    createdAt: 'May 05, 2026',
    body: 'This month we shipped 14 new AI features, improved dashboard load time by 40%, and added WhatsApp automation triggers.',
  },
  {
    id: 'c3',
    name: 'Cold Lead Revival — May',
    channel: 'whatsapp',
    status: 'scheduled',
    audience: 'Cold Leads (72h inactive)',
    sent: 0,
    opened: 0,
    clicked: 0,
    createdAt: 'May 18, 2026',
    body: 'Namaste! We noticed you explored VYRON AI recently. Book a free 15-min strategy call — let us show you the ROI.',
  },
  {
    id: 'c4',
    name: 'Startup Tier Upsell Blast',
    channel: 'email',
    status: 'draft',
    audience: 'Starter Plan Users',
    sent: 0,
    opened: 0,
    clicked: 0,
    createdAt: 'May 17, 2026',
    body: 'You are on the Starter plan. Unlock AI Business Coach, WhatsApp automation, and advanced analytics with Growth — from ₹2,499/mo.',
  },
];

const STATUS_STYLES: Record<CampaignStatus, { color: string; icon: React.ReactNode; label: string }> = {
  sent:      { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle className="h-3 w-3" />, label: 'Sent' },
  scheduled: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       icon: <Clock className="h-3 w-3" />,         label: 'Scheduled' },
  draft:     { color: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',           icon: <Eye className="h-3 w-3" />,            label: 'Draft' },
  failed:    { color: 'bg-red-500/10 text-red-400 border-red-500/20',             icon: <XCircle className="h-3 w-3" />,        label: 'Failed' },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | CampaignChannel>('all');

  // Form state
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('whatsapp');
  const [audience, setAudience] = useState('All Customers');
  const [body, setBody] = useState('');
  const [generating, setGenerating] = useState(false);

  const filtered = campaigns.filter(c => activeTab === 'all' || c.channel === activeTab);

  const handleGenerateCopy = async () => {
    if (!name.trim()) { toast.error('Enter a campaign name first.'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Write a short ${channel === 'whatsapp' ? 'WhatsApp' : 'email'} campaign message for: "${name}". Audience: ${audience}. Keep it under 100 words, engaging, with a clear CTA. No subject line needed.`,
          }],
        }),
      });
      const data = await res.json();
      if (data.success) { setBody(data.text); toast.success('AI copy generated!'); }
      else toast.error('Generation failed.');
    } catch { toast.error('Failed to reach AI.'); }
    setGenerating(false);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) { toast.error('Fill in campaign name and body.'); return; }
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name: name.trim(),
      channel,
      status: 'draft',
      audience,
      sent: 0, opened: 0, clicked: 0,
      createdAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      body: body.trim(),
    };
    setCampaigns([newCampaign, ...campaigns]);
    setName(''); setBody(''); setAudience('All Customers'); setChannel('whatsapp');
    setShowCreate(false);
    toast.success(`Campaign "${newCampaign.name}" created as draft!`);
  };

  const handleSend = (id: string, campaignName: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'sent', sent: Math.floor(Math.random() * 200) + 50 } : c));
    toast.success(`Campaign "${campaignName}" dispatched successfully!`);
  };

  const handleDelete = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    toast.success('Campaign removed.');
  };

  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalOpened = campaigns.reduce((a, c) => a + c.opened, 0);
  const totalClicked = campaigns.reduce((a, c) => a + c.clicked, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Campaign Manager
          </h1>
          <p className="text-xs text-zinc-500">
            Deploy WhatsApp & Email campaigns with AI-generated copy and real-time delivery tracking.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-white text-black hover:bg-zinc-200 rounded-xl text-xs px-4 h-9 gap-1.5 font-bold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <FeatureGateShield feature="marketing_engine" requiredPlan="Growth">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Campaigns', value: campaigns.length, icon: <Megaphone className="h-4 w-4 text-cyan-400" />, color: 'text-white' },
            { label: 'Total Delivered', value: totalSent.toLocaleString(), icon: <Users className="h-4 w-4 text-violet-400" />, color: 'text-white' },
            { label: 'Total Opened', value: totalOpened.toLocaleString(), icon: <Eye className="h-4 w-4 text-amber-400" />, color: 'text-amber-400' },
            { label: 'Avg. Open Rate', value: `${openRate}%`, icon: <MousePointerClick className="h-4 w-4 text-emerald-400" />, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-400">{stat.icon}{stat.label}</div>
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Create Campaign Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 16 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Megaphone className="h-4 w-4 text-cyan-400" />
                    Create New Campaign
                  </h3>
                  <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white text-xs">Cancel</button>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Campaign Name</label>
                      <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Diwali Promo 2026" className="bg-zinc-900 border-white/10 h-9 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Channel</label>
                      <select value={channel} onChange={e => setChannel(e.target.value as CampaignChannel)} className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2.5 h-9 text-xs focus:outline-none text-white">
                        <option value="whatsapp">WhatsApp (WATI)</option>
                        <option value="email">Email (Resend)</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-zinc-400">Target Audience</label>
                      <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2.5 h-9 text-xs focus:outline-none text-white">
                        <option>All Customers</option>
                        <option>Pro & Growth Subscribers</option>
                        <option>Starter Plan Users</option>
                        <option>Cold Leads (72h inactive)</option>
                        <option>Unpaid Invoice Customers</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-400">Campaign Body</label>
                      <button
                        type="button"
                        onClick={handleGenerateCopy}
                        disabled={generating}
                        className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-semibold"
                      >
                        {generating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        {generating ? 'Generating...' : 'AI Generate'}
                      </button>
                    </div>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="Write your campaign message or click AI Generate..."
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-xs min-h-[110px] focus:outline-none text-white placeholder-zinc-600 resize-none"
                    />
                    <p className="text-[10px] text-zinc-600">{body.length} characters</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-xs h-9 rounded-xl">Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-xs h-9 rounded-xl px-5">
                      Save as Draft
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'whatsapp', 'email'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              {tab === 'whatsapp' ? 'WhatsApp' : tab === 'email' ? 'Email' : 'All Channels'}
            </button>
          ))}
        </div>

        {/* Campaign Cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((campaign, i) => {
              const st = STATUS_STYLES[campaign.status];
              const clickRate = campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0;
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Channel icon */}
                    <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${
                      campaign.channel === 'whatsapp' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-blue-500/10 border border-blue-500/20'
                    }`}>
                      {campaign.channel === 'whatsapp'
                        ? <MessageSquare className="h-5 w-5 text-emerald-400" />
                        : <Mail className="h-5 w-5 text-blue-400" />
                      }
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{campaign.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{campaign.channel.toUpperCase()} · {campaign.audience}</span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{campaign.body}</p>

                      {/* Delivery Stats */}
                      {campaign.sent > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Sent', value: campaign.sent, color: 'text-white' },
                            { label: 'Opened', value: campaign.opened, color: 'text-amber-400' },
                            { label: 'CTR', value: `${clickRate}%`, color: 'text-cyan-400' },
                          ].map(s => (
                            <div key={s.label} className="rounded-lg bg-white/5 p-2 text-center border border-white/5">
                              <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] text-zinc-600 font-mono">{campaign.createdAt}</span>
                      {campaign.status === 'draft' && (
                        <Button
                          onClick={() => handleSend(campaign.id, campaign.name)}
                          className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-[10px] h-7 px-3 rounded-lg font-bold gap-1"
                        >
                          <Send className="h-3 w-3" /> Launch
                        </Button>
                      )}
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
              <Megaphone className="h-8 w-8 text-zinc-700" />
              <p className="text-sm font-semibold text-zinc-400">No campaigns yet</p>
              <p className="text-xs max-w-xs">Create your first WhatsApp or email campaign to start engaging your audience.</p>
            </div>
          )}
        </div>
      </FeatureGateShield>
    </div>
  );
}
