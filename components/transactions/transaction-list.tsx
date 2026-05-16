'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { formatINR } from '@/lib/utils';
import { formatIST } from '@/lib/datetime';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transaction } from '@/types/database';

async function fetchTransactions(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)
    .order('transaction_date', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Transaction[];
}

export function TransactionList() {
  const { activeId } = useWorkspace();
  const { data, error, isLoading } = useSWR(
    activeId ? ['transactions', activeId] : null,
    () => fetchTransactions(activeId!)
  );

  if (!activeId) {
    return <p className="text-zinc-500">Select a workspace.</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">Failed to load transactions.</p>;
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-zinc-400">No transactions yet.</p>
        <p className="mt-1 text-sm text-zinc-600">Add your first income or expense.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {data.map((tx) => (
        <li
          key={tx.id}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
        >
          <div>
            <p className="font-medium">{tx.description ?? tx.category ?? tx.type}</p>
            <p className="text-xs text-zinc-500">
              {formatIST(tx.transaction_date, 'dd MMM yyyy')} · {tx.type}
            </p>
          </div>
          <span
            className={
              tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
            }
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatINR(Number(tx.amount_inr))}
          </span>
        </li>
      ))}
    </ul>
  );
}
