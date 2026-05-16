'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';

interface Props {
  income: number;
  expense: number;
  leads: number;
  credits: number;
  plan: string;
  status: string;
}

export function DashboardStats({
  income,
  expense,
  leads,
  credits,
  plan,
  status,
}: Props) {
  const items = [
    { label: 'Income (MTD)', value: formatINR(income), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Expenses (MTD)', value: formatINR(expense), icon: TrendingDown, color: 'text-red-400' },
    { label: 'Active leads', value: String(leads), icon: Users, color: 'text-cyan-400' },
    { label: 'AI credits', value: String(credits), icon: Sparkles, color: 'text-violet-400' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Icon className={`h-8 w-8 ${item.color}`} />
                <div>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className="text-xl font-semibold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
      <p className="col-span-full text-xs text-zinc-600 capitalize">
        {plan} plan · {status.replace('_', ' ')}
      </p>
    </div>
  );
}
