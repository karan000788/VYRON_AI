'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Gift, Zap, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function LoyaltyRewards() {
  const [claimedBonus, setClaimedBonus] = useState(false);
  const streak = 14; // Mock daily streak count

  const BADGES = [
    { name: 'SaaS Builder', desc: 'Active workspace', icon: Zap, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    { name: 'GST Pioneer', desc: 'First GST Invoice', icon: Award, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { name: 'Lead Master', desc: '10+ Active Leads', icon: Trophy, color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  ];

  const claimCredits = () => {
    if (claimedBonus) return;
    setClaimedBonus(true);
    toast.success('Bonus 250 AI Credits added to your balance!');
  };

  return (
    <Card className="relative overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
      
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-white">Loyalty & Streaks</CardTitle>
            <CardDescription className="text-xs">Claim milestones and reward badges</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {/* Streak Counter */}
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase font-medium">Daily Streak</span>
            <p className="text-xl font-extrabold text-white flex items-center gap-1.5">
              <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400/20" />
              {streak} Days Active
            </p>
          </div>
          <Button
            size="sm"
            onClick={claimCredits}
            disabled={claimedBonus}
            className={`rounded-lg text-xs ${
              claimedBonus 
                ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-800' 
                : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:opacity-90 font-bold'
            }`}
          >
            {claimedBonus ? 'Claimed (+250)' : 'Claim Daily Bonus'}
          </Button>
        </div>

        {/* Milestones list */}
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-zinc-300">Milestone Unlocks</h5>
          <div className="grid gap-3 sm:grid-cols-3">
            {BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.name}
                  className={`flex flex-col items-center justify-center text-center p-3 rounded-xl border transition-all hover:scale-105 ${b.color}`}
                >
                  <Icon className="h-5 w-5 mb-1.5" />
                  <span className="text-[11px] font-bold text-white">{b.name}</span>
                  <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{b.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1 Year Anniversary Teaser */}
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 mt-0.5">
            <Gift className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h6 className="font-bold text-white flex items-center gap-1">
              Premium Badge Unlock
              <Heart className="h-3 w-3 text-red-400 fill-red-400" />
            </h6>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Complete 1 year of continuous operation on VYRON AI to unlock our premium loyalty credit tier and an extra 5,000 bonus credits!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
