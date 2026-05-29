'use client';

import { motion } from 'framer-motion';
import { Building2, FileText, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';

interface Props {
  totalRevenue: number;
  totalLeads: number;
  invoicesSent: number;
  activeClients: number;
}

export function DashboardStats({
  totalRevenue,
  totalLeads,
  invoicesSent,
  activeClients,
}: Props) {
  const items = [
    {
      label: 'Total Revenue',
      value: formatINR(totalRevenue),
      helper: totalRevenue === 0 ? 'Create your first invoice →' : 'From income transactions',
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Total Leads',
      value: String(totalLeads),
      helper: totalLeads === 0 ? 'Add your first lead →' : 'Live CRM count',
      icon: Users,
      color: 'text-cyan-400',
    },
    {
      label: 'Invoices Sent',
      value: String(invoicesSent),
      helper: invoicesSent === 0 ? 'Create your first invoice →' : 'Sent, paid, and overdue',
      icon: FileText,
      color: 'text-violet-400',
    },
    {
      label: 'Active Clients',
      value: String(activeClients),
      helper: activeClients === 0 ? 'Add your first client →' : 'Customer records',
      icon: Building2,
      color: 'text-amber-400',
    },
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
                  <p className="mt-1 text-[10px] text-zinc-600">{item.helper}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
