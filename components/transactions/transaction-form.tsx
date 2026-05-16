'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { TransactionType } from '@/types/database';

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { activeId } = useWorkspace();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Not authenticated');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      business_id: activeId,
      type,
      amount_inr: parseFloat(amount),
      description: description || null,
      category: category || null,
      transaction_date: date,
      created_by: user.id,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Transaction added');
    setAmount('');
    setDescription('');
    setCategory('');
    onSuccess?.();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex gap-2">
        {(['income', 'expense'] as TransactionType[]).map((t) => (
          <Button
            key={t}
            type="button"
            size="sm"
            variant={type === t ? 'default' : 'secondary'}
            onClick={() => setType(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Amount (INR)</Label>
          <Input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Software" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Add transaction'}
      </Button>
    </form>
  );
}
