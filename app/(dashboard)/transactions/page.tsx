'use client';

import { useState } from 'react';
import { TransactionList } from '@/components/transactions/transaction-list';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-zinc-400">Track income and expenses</p>
        </div>
        <Button variant="secondary" onClick={() => setRefresh((r) => r + 1)}>
          Refresh
        </Button>
      </div>
      <TransactionForm onSuccess={() => setRefresh((r) => r + 1)} />
      <TransactionList key={refresh} />
    </div>
  );
}
