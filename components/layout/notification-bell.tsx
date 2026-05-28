'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, AlertTriangle, CheckCircle, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { formatINR } from '@/lib/utils';
import { playChime } from '@/lib/sound';

interface SystemNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success';
  time: string;
}

const STATIC_SYSTEM: SystemNotification[] = [
  {
    id: 'n1',
    title: 'WATI Template Approved',
    body: 'Your custom invoice reminder template has been approved by WhatsApp.',
    type: 'success',
    time: '2 hrs ago',
  },
  {
    id: 'n2',
    title: 'Linear Forecast Run',
    body: 'AI growth model computed 11.6% projected expansion for next month.',
    type: 'info',
    time: '4 hrs ago',
  },
];

export function NotificationBell() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [notifications, setNotifications] = useState<SystemNotification[]>(STATIC_SYSTEM);
  const [open, setOpen] = useState(false);

  // Query actual unpaid invoices and credits
  useEffect(() => {
    async function loadNotifications() {
      if (!activeWorkspaceId) return;
      const supabase = createClient();
      const newAlerts: SystemNotification[] = [...STATIC_SYSTEM];

      try {
        // 1. Check AI Credits from subscriptions
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('ai_credits_remaining, plan')
          .eq('business_id', activeWorkspaceId)
          .single();

        if (sub && sub.ai_credits_remaining < 250) {
          newAlerts.push({
            id: 'credits_alert',
            title: 'Critical AI Credits Low',
            body: `You only have ${sub.ai_credits_remaining} AI credits remaining in your ${sub.plan} plan. Upgrade soon!`,
            type: 'warning',
            time: 'Just now',
          });
        }

        // 2. Check unpaid invoices
        const { data: unpaid } = await supabase
          .from('invoices')
          .select('invoice_number, total_inr, due_date')
          .eq('business_id', activeWorkspaceId)
          .neq('status', 'paid')
          .limit(3);

        if (unpaid && unpaid.length > 0) {
          unpaid.forEach((inv, i) => {
            const today = new Date();
            const due = new Date(inv.due_date);
            const isOverdue = due < today;

            newAlerts.push({
              id: `inv_alert_${i}`,
              title: isOverdue ? 'GST Invoice Overdue' : 'Unpaid Invoice Outstanding',
              body: `Invoice ${inv.invoice_number} of ${formatINR(Number(inv.total_inr))} requires payment collection.`,
              type: isOverdue ? 'warning' : 'info',
              time: isOverdue ? 'Overdue' : 'Due shortly',
            });
          });
        }

        setNotifications(newAlerts);
      } catch (err) {
        console.warn('Failed to load dynamic notification alerts:', err);
      }
    }

    loadNotifications();
  }, [activeWorkspaceId]);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
    playChime('delete');
    toast.success('Notification dismissed.');
  };

  const handleClearAll = () => {
    setNotifications([]);
    setOpen(false);
    playChime('delete');
    toast.success('All notifications cleared successfully!');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />;
    }
  };

  return (
    <div className="relative z-50">
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setOpen(!open);
          playChime('info');
        }}
        className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white transition-all shadow-md focus:outline-none cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg shadow-red-500/25 animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Glassmorphic Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl z-40 text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                <span className="font-bold text-white">System Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-zinc-500">
                  <CheckCircle className="h-6 w-6 text-zinc-700 mx-auto mb-1.5" />
                  <span>No unread notifications</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-2.5 p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative"
                    >
                      <div className="mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 space-y-0.5 pr-6">
                        <h6 className="font-bold text-white leading-normal">{n.title}</h6>
                        <p className="text-[10px] text-zinc-400 leading-normal">{n.body}</p>
                        <span className="text-[9px] text-zinc-600 block pt-0.5 font-mono">{n.time}</span>
                      </div>
                      <button
                        onClick={(e) => handleDismiss(n.id, e)}
                        className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white transition-colors"
                        title="Dismiss alert"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
