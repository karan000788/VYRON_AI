'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/lib/utils';
import type { Lead } from '@/types/database';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads CRM</h1>
        <p className="text-zinc-400">Pipeline and lead management</p>
      </div>
      {isLoading && <Skeleton className="h-32 w-full" />}
      {!isLoading && !data?.length && (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
          No leads yet. Add leads from your campaigns or manually.
        </div>
      )}
      <ul className="space-y-2">
        {data?.map((lead) => (
          <li
            key={lead.id}
            className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
          >
            <div>
              <p className="font-medium">{lead.title}</p>
              <p className="text-xs capitalize text-zinc-500">{lead.status}</p>
            </div>
            {lead.value_inr != null && (
              <span className="text-cyan-400">{formatINR(Number(lead.value_inr))}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
