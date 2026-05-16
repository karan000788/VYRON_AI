'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const { activeId } = useWorkspace();
  const { data } = useSWR(activeId ? ['ai-usage', activeId] : null, async () => {
    const { data: logs } = await createClient()
      .from('ai_usage_logs')
      .select('credits_used, model, created_at')
      .eq('business_id', activeId!)
      .order('created_at', { ascending: false })
      .limit(20);
    return logs ?? [];
  });

  const totalCredits = data?.reduce((s, l) => s + l.credits_used, 0) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI usage analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-violet-400">{totalCredits}</p>
          <p className="text-sm text-zinc-500">Credits used (last 20 requests)</p>
          <ul className="mt-4 space-y-1 text-sm text-zinc-400">
            {data?.map((l, i) => (
              <li key={i}>
                {l.model} — {l.credits_used} credits
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
