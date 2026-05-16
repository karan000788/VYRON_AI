'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { formatINR } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { Invoice } from '@/types/database';

async function fetchInvoices(businessId: string): Promise<Invoice[]> {
  const { data, error } = await createClient()
    .from('invoices')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

export default function InvoicesPage() {
  const { activeId } = useWorkspace();
  const { data, isLoading } = useSWR(
    activeId ? ['invoices', activeId] : null,
    () => fetchInvoices(activeId!)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">GST Invoices</h1>
        <p className="text-zinc-400">CGST / SGST / IGST compliant billing</p>
      </div>
      {isLoading && <Skeleton className="h-32 w-full" />}
      {!isLoading && !data?.length && (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500">
          No invoices yet. Create a customer first, then generate an invoice.
        </div>
      )}
      <ul className="space-y-2">
        {data?.map((inv) => (
          <li
            key={inv.id}
            className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
          >
            <div>
              <p className="font-medium">{inv.invoice_number}</p>
              <p className="text-xs capitalize text-zinc-500">{inv.status}</p>
            </div>
            <span>{formatINR(Number(inv.total_inr))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
