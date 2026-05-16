import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { transitionStatus } from '@/lib/subscription/state-machine';
import { sendNightlySummary } from '@/lib/wati/client';
import { monthlyCreditsForPlan } from '@/lib/ai/credits';
import type { SubscriptionPlan } from '@/types/database';

export const nightlyReports = inngest.createFunction(
  { id: 'nightly-reports' },
  { cron: '0 20 * * *' },
  async () => {
    const admin = createAdminClient();
    const { data: businesses } = await admin
      .from('businesses')
      .select('id, name')
      .is('deleted_at', null);

    for (const biz of businesses ?? []) {
      const { data: txs } = await admin
        .from('transactions')
        .select('type, amount_inr')
        .eq('business_id', biz.id)
        .gte('transaction_date', new Date(Date.now() - 86400000).toISOString().slice(0, 10));

      const income = (txs ?? [])
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount_inr), 0);
      const expense = (txs ?? [])
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount_inr), 0);

      const { data: owner } = await admin
        .from('memberships')
        .select('user_id')
        .eq('business_id', biz.id)
        .eq('role', 'owner')
        .limit(1)
        .maybeSingle();

      if (owner?.user_id) {
        await admin.from('reports').insert({
          business_id: biz.id,
          title: `Daily Report — ${new Date().toISOString().slice(0, 10)}`,
          report_type: 'daily',
          period_start: new Date().toISOString().slice(0, 10),
          period_end: new Date().toISOString().slice(0, 10),
          data: { income, expense, net: income - expense },
          created_by: owner.user_id,
        });
      }
    }
    return { processed: businesses?.length ?? 0 };
  }
);

export const aiDailyBriefing = inngest.createFunction(
  { id: 'ai-daily-briefing' },
  { cron: '0 6 * * *' },
  async () => {
    return { status: 'queued_for_ai_worker' };
  }
);

export const deliverReminders = inngest.createFunction(
  { id: 'deliver-reminders' },
  { cron: '*/15 * * * *' },
  async () => {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    const { data: reminders } = await admin
      .from('reminders')
      .select('*')
      .lte('due_at', now)
      .is('sent_at', null)
      .limit(50);

    for (const r of reminders ?? []) {
      await admin.from('notifications').insert({
        business_id: r.business_id,
        user_id: r.created_by,
        title: r.title,
        body: 'Reminder due',
        channel: r.channel,
        created_by: r.created_by,
      });
      await admin
        .from('reminders')
        .update({ sent_at: now })
        .eq('id', r.id);
    }
    return { sent: reminders?.length ?? 0 };
  }
);

export const aiHistoryCleanup = inngest.createFunction(
  { id: 'ai-history-cleanup' },
  { cron: '0 2 * * *' },
  async () => {
    const admin = createAdminClient();
    const { data: expired } = await admin
      .from('ai_memories')
      .select('id')
      .lt('expires_at', new Date().toISOString());
    if (expired?.length) {
      await admin
        .from('ai_memories')
        .delete()
        .in(
          'id',
          expired.map((r) => r.id)
        );
    }
    return { deleted: expired?.length ?? 0 };
  }
);

export const subscriptionGraceHandler = inngest.createFunction(
  { id: 'subscription-grace-handler' },
  { cron: '0 * * * *' },
  async () => {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: failed } = await admin
      .from('subscriptions')
      .select('*')
      .eq('status', 'payment_failed')
      .lt('payment_failed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    for (const sub of failed ?? []) {
      await admin
        .from('subscriptions')
        .update({
          status: transitionStatus('payment_failed', 'grace_period_started'),
          grace_period_ends_at: new Date(Date.now() + 3 * 86400000).toISOString(),
        })
        .eq('id', sub.id);
    }

    const { data: graceExpired } = await admin
      .from('subscriptions')
      .select('*')
      .eq('status', 'grace_period')
      .lt('grace_period_ends_at', now);

    for (const sub of graceExpired ?? []) {
      await admin
        .from('subscriptions')
        .update({
          status: transitionStatus('grace_period', 'suspended'),
          suspended_at: now,
        })
        .eq('id', sub.id);
    }

    return { movedToGrace: failed?.length ?? 0, suspended: graceExpired?.length ?? 0 };
  }
);

export const resetMonthlyCredits = inngest.createFunction(
  { id: 'reset-monthly-credits' },
  { cron: '0 0 1 * *' },
  async () => {
    const admin = createAdminClient();
    const { data: subs } = await admin.from('subscriptions').select('id, plan');

    for (const sub of subs ?? []) {
      const credits = monthlyCreditsForPlan(sub.plan as SubscriptionPlan);
      await admin
        .from('subscriptions')
        .update({
          ai_credits_remaining: credits,
          ai_credits_reset_at: new Date().toISOString(),
        })
        .eq('id', sub.id);
    }
    return { reset: subs?.length ?? 0 };
  }
);

export const activityLogRetention = inngest.createFunction(
  { id: 'activity-log-retention' },
  { cron: '0 3 * * 0' },
  async () => {
    const admin = createAdminClient();
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    await admin
      .from('activity_logs')
      .delete()
      .lt('created_at', cutoff.toISOString());
    return { cutoff: cutoff.toISOString() };
  }
);

export const inngestFunctions = [
  nightlyReports,
  aiDailyBriefing,
  deliverReminders,
  aiHistoryCleanup,
  subscriptionGraceHandler,
  resetMonthlyCredits,
  activityLogRetention,
];
