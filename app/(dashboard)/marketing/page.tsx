'use client';

import React, { useState } from 'react';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Megaphone, Sparkles, Copy, Calendar, RefreshCw, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingPage() {
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Professional');
  const [product, setProduct] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) {
      toast.error('Specify your product or service details.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate ${platform} copy for product: "${product}". Audience: "${targetAudience}". Tone: "${tone}". Include engaging hooks and matching hashtags.`,
            },
          ],
          taskType: 'marketing',
        }),
      });

      setLoading(false);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Marketing generation failed.');
        return;
      }

      setResult(data.text || data.content);
      toast.success('Campaign copy successfully generated!');
    } catch (err) {
      setLoading(false);
      toast.error('Failed to establish connection for marketing copy.');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success('Copy saved to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          AI Marketing Engine
        </h1>
        <p className="text-xs text-zinc-500">
          Build festival campaigns, Instagram ad copy, WhatsApp promo hooks, and video scripts using advanced AI.
        </p>
      </div>

      <FeatureGateShield feature="marketing_engine" requiredPlan="Growth">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campaign Parameters Form */}
          <div className="lg:col-span-1">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4 text-cyan-400" />
                  Campaign Parameters
                </CardTitle>
                <CardDescription className="text-xs">Configure your demographic targets & style</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-zinc-400">Target Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 h-8.5 focus:outline-none"
                    >
                      <option value="Instagram">Instagram Caption</option>
                      <option value="WhatsApp Campaign">WhatsApp Campaign</option>
                      <option value="Festival Campaign">Festival Campaign Copy</option>
                      <option value="Video Script">Video Hook & Script</option>
                      <option value="LinkedIn Ad">LinkedIn Professional Post</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Tone of Voice</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-zinc-900 px-2.5 h-8.5 focus:outline-none"
                    >
                      <option value="Professional">Professional & Corporate</option>
                      <option value="Witty & Bold">Witty & Bold</option>
                      <option value="Festive & Joyous">Festive & Joyous (Indian festivals)</option>
                      <option value="Direct & Urgent">Direct Response / Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Product / Service Details</label>
                    <textarea
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="e.g. VYRON AI - Unified GST invoice & CRM SaaS workspace for Indian operators"
                      className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-xs min-h-[75px] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400">Target Audience (optional)</label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. freelancers, local traders, Indian startup founders"
                      className="bg-zinc-900 border-white/10 text-xs h-9"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-xs h-9 rounded-xl gap-1.5"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate Copy
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Marketing Output Panel */}
          <div className="lg:col-span-2">
            <Card className="border border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full flex flex-col min-h-[450px]">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
                  AI Campaign Output
                </CardTitle>
                <CardDescription className="text-xs">Generated ad copy, hooks, and festival campaigns</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-6 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col space-y-4"
                    >
                      <div className="flex-1 rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {result}
                      </div>

                      <div className="flex justify-end gap-2.5">
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          className="border-white/10 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs h-9 gap-1.5"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy Text
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center text-zinc-500 py-16 space-y-3">
                      <Megaphone className="h-10 w-10 text-zinc-700 animate-pulse" />
                      <h5 className="text-sm font-bold text-zinc-400">Creative Hub Ready</h5>
                      <p className="text-xs max-w-sm">
                        Input product details on the left, and watch the AI write engaging ad hooks and captions.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </FeatureGateShield>
    </div>
  );
}
