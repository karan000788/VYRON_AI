'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { formatINR } from '@/lib/utils';
import { formatIST } from '@/lib/datetime';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { playChime } from '@/lib/sound';
import { RealtimeManager } from '@/lib/realtime-manager';
import {
  Search,
  SlidersHorizontal,
  Download,
  Trash2,
  Edit2,
  FileText,
  User,
  Plus,
  Landmark,
  Tags,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  AlertTriangle,
  X,
  RotateCcw,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Transaction, TransactionMetadata } from '@/types/database';

async function fetchTransactions(businessId: string): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)
    .order('transaction_date', { ascending: false });
  if (error) throw error;
  return (data || []) as Transaction[];
}

export function TransactionList() {
  const { activeId } = useWorkspace();
  const { data, error, isLoading } = useSWR(
    activeId ? ['transactions', activeId] : null,
    () => fetchTransactions(activeId!)
  );

  // Local state for optimistic UI updates
  const [localTxs, setLocalTxs] = useState<Transaction[]>([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month' | 'month30'>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTrash, setShowTrash] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Detail drawer & Edit modal states
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Edit form states
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editMode, setEditMode] = useState<'upi' | 'cash' | 'bank_transfer' | 'card'>('upi');
  const [editStatus, setEditStatus] = useState<'completed' | 'pending' | 'failed'>('completed');

  // Sync SWR data to local state
  useEffect(() => {
    if (data) {
      setLocalTxs(data);
    }
  }, [data]);

  // Real-time Supabase Presence & event bus channel integration
  useEffect(() => {
    if (!activeId) return;
    const unsubscribe = RealtimeManager.subscribe(activeId, (payload) => {
      // Trigger SWR revalidation
      mutate(['transactions', activeId]);
    });
    return () => unsubscribe();
  }, [activeId]);

  if (!activeId) {
    return <p className="text-zinc-500 text-xs">Select a workspace.</p>;
  }

  // Soft Delete Action (optimistic)
  const handleSoftDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Save backup for rollback
    const backup = [...localTxs];
    const target = localTxs.find(t => t.id === id);
    if (!target) return;

    // Optimistically update UI
    const updated = localTxs.map(t => 
      t.id === id ? { ...t, deleted_at: new Date().toISOString() } : t
    );
    setLocalTxs(updated);
    setSelectedTx(null);
    playChime('delete');
    toast.success('Transaction moved to Trash Bin.', {
      action: {
        label: 'Undo',
        onClick: () => handleRestore(id),
      },
    });

    // Supabase persist
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (err) throw err;
      mutate(['transactions', activeId]);
    } catch {
      // Rollback
      setLocalTxs(backup);
      playChime('warning');
      toast.error('Failed to move transaction to trash.');
    }
  };

  // Restore action (optimistic)
  const handleRestore = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const backup = [...localTxs];
    const updated = localTxs.map(t => 
      t.id === id ? { ...t, deleted_at: null } : t
    );
    setLocalTxs(updated);
    playChime('success');
    toast.success('Transaction restored successfully!');

    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('transactions')
        .update({ deleted_at: null })
        .eq('id', id);

      if (err) throw err;
      mutate(['transactions', activeId]);
    } catch {
      setLocalTxs(backup);
      playChime('warning');
      toast.error('Failed to restore transaction.');
    }
  };

  // Permanent Delete Action
  const handlePermanentDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const confirm = window.confirm('Are you sure you want to permanently delete this transaction from accounting ledgers? This action CANNOT be undone.');
    if (!confirm) return;

    const backup = [...localTxs];
    const updated = localTxs.filter(t => t.id !== id);
    setLocalTxs(updated);
    setSelectedTx(null);
    playChime('delete');
    toast.success('Transaction permanently purged from database.');

    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (err) throw err;
      mutate(['transactions', activeId]);
    } catch {
      setLocalTxs(backup);
      playChime('warning');
      toast.error('Purge failed.');
    }
  };

  // Toggle Edit Modal
  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(String(tx.amount_inr));
    setEditDescription(tx.description || '');
    setEditCategory(tx.category || '');
    setEditDate(tx.transaction_date);
    setEditMode(tx.metadata?.payment_mode || 'upi');
    setEditStatus(tx.metadata?.payment_status || 'completed');
    setSelectedTx(null);
  };

  // Submit Edit (optimistic)
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const amt = parseFloat(editAmount);
    if (amt <= 0) {
      toast.error('Amount must be positive.');
      return;
    }

    const backup = [...localTxs];
    const updatedMeta = {
      ...(editingTx.metadata || {}),
      payment_mode: editMode,
      payment_status: editStatus,
    };

    // Optimistically update
    const updated = localTxs.map(t => 
      t.id === editingTx.id 
        ? { 
            ...t, 
            amount_inr: amt, 
            description: editDescription.trim(), 
            category: editCategory.trim(),
            transaction_date: editDate,
            metadata: updatedMeta
          } 
        : t
    );
    setLocalTxs(updated);
    setEditingTx(null);
    playChime('success');
    toast.success('Transaction updated!');

    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from('transactions')
        .update({
          amount_inr: amt,
          description: editDescription.trim() || null,
          category: editCategory.trim() || null,
          transaction_date: editDate,
          metadata: updatedMeta
        })
        .eq('id', editingTx.id);

      if (err) throw err;
      mutate(['transactions', activeId]);
    } catch {
      setLocalTxs(backup);
      playChime('warning');
      toast.error('Failed to update transaction.');
    }
  };

  // Filter transactions
  const processedTxs = localTxs.filter((tx) => {
    // 1. Trash toggle filter
    const isDeleted = tx.deleted_at !== null;
    if (showTrash !== isDeleted) return false;

    // 2. Search filter (Fuzzy / Contains)
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const desc = (tx.description || '').toLowerCase();
      const cat = (tx.category || '').toLowerCase();
      const cust = (tx.metadata?.customer_name || '').toLowerCase();
      const mode = (tx.metadata?.payment_mode || '').toLowerCase();
      const amt = String(tx.amount_inr);
      const tags = (tx.metadata?.tags || []).join(' ').toLowerCase();

      const matches =
        desc.includes(query) ||
        cat.includes(query) ||
        cust.includes(query) ||
        mode.includes(query) ||
        amt.includes(query) ||
        tags.includes(query);
      if (!matches) return false;
    }

    // 3. Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false;

    // 4. Date filter
    if (filterDate !== 'all') {
      const txDate = new Date(tx.transaction_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterDate === 'today') {
        const dStr = txDate.toISOString().slice(0, 10);
        const tStr = today.toISOString().slice(0, 10);
        if (dStr !== tStr) return false;
      } else if (filterDate === 'week') {
        const diff = today.getTime() - txDate.getTime();
        if (diff > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (filterDate === 'month') {
        if (txDate.getMonth() !== today.getMonth() || txDate.getFullYear() !== today.getFullYear()) return false;
      } else if (filterDate === 'month30') {
        const diff = today.getTime() - txDate.getTime();
        if (diff > 30 * 24 * 60 * 60 * 1000) return false;
      }
    }

    // 5. Payment Mode filter
    if (filterMode !== 'all' && tx.metadata?.payment_mode !== filterMode) return false;

    // 6. Payment Status filter
    if (filterStatus !== 'all' && tx.metadata?.payment_status !== filterStatus) return false;

    return true;
  });

  // Sort transactions
  const sortedTxs = [...processedTxs].sort((a, b) => {
    const aDate = new Date(a.transaction_date).getTime();
    const bDate = new Date(b.transaction_date).getTime();
    const aAmt = Number(a.amount_inr);
    const bAmt = Number(b.amount_inr);

    if (sortBy === 'date-desc') return bDate - aDate;
    if (sortBy === 'date-asc') return aDate - bDate;
    if (sortBy === 'amount-desc') return bAmt - aAmt;
    if (sortBy === 'amount-asc') return aAmt - bAmt;
    return 0;
  });

  // MTD KPI Stats calculations based on *processedTxs* (recalculates live as you filter!)
  let mtdIncome = 0;
  let mtdExpense = 0;
  let pendingReceivables = 0;
  let pendingPayables = 0;

  processedTxs.forEach((tx) => {
    const amt = Number(tx.amount_inr);
    const status = tx.metadata?.payment_status || 'completed';

    if (tx.type === 'income') {
      if (status === 'completed') mtdIncome += amt;
      else if (status === 'pending') pendingReceivables += amt;
    } else if (tx.type === 'expense') {
      if (status === 'completed') mtdExpense += amt;
      else if (status === 'pending') pendingPayables += amt;
    }
  });

  const netCashflow = mtdIncome - mtdExpense;

  // CSV Ledger Exporter
  const handleExportCSV = () => {
    if (processedTxs.length === 0) {
      toast.warning('No transactions available to export.');
      return;
    }

    const headers = ['Date', 'Type', 'Amount (INR)', 'Category', 'Description', 'Payment Mode', 'Status', 'Customer', 'CGST', 'SGST', 'IGST', 'Tags'];
    const rows = processedTxs.map((tx) => [
      tx.transaction_date,
      tx.type,
      tx.amount_inr,
      tx.category || '',
      tx.description || '',
      tx.metadata?.payment_mode || 'upi',
      tx.metadata?.payment_status || 'completed',
      tx.metadata?.customer_name || '',
      tx.metadata?.cgst_amount || 0,
      tx.metadata?.sgst_amount || 0,
      tx.metadata?.igst_amount || 0,
      (tx.metadata?.tags || []).join(' '),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VYRON_Ledger_${activeId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playChime('success');
    toast.success('Ledger exported successfully as CSV!');
  };

  // Seed ledger with quick dummy company records
  const handleLoadDemoData = async () => {
    playChime('success');
    toast.success('Seeding demo transactions inside workspace...');
    try {
      const res = await fetch('/api/dev/fake-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: activeId, event: 'seed_ledger' }),
      });
      if (res.ok) {
        mutate(['transactions', activeId]);
        toast.success('Demo transactions imported. Visualizing charts.');
      }
    } catch {
      toast.error('Failed to seed ledger.');
    }
  };

  return (
    <div className="space-y-6 relative z-10 text-xs text-zinc-300 select-none">
      
      {/* Metrics Cards row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'MTD Income', val: mtdIncome, icon: <TrendingUp className="h-4 w-4 text-emerald-400" />, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
          { label: 'MTD Expenses', val: mtdExpense, icon: <TrendingDown className="h-4 w-4 text-red-400" />, color: 'text-red-400 border-red-500/20 bg-red-500/5' },
          { label: 'Net Cashflow', val: netCashflow, icon: <DollarSign className="h-4 w-4 text-cyan-400" />, color: `${netCashflow >= 0 ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}` },
          { label: 'Pending (Recv/Pay)', val: `${formatINR(pendingReceivables)} / ${formatINR(pendingPayables)}`, isText: true, icon: <Clock className="h-4 w-4 text-amber-400" />, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-4 space-y-1 ${card.color}`}
          >
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
              {card.icon}
              {card.label}
            </span>
            <p className="text-base font-extrabold text-white">
              {card.isText ? card.val : formatINR(Number(card.val))}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Action filters bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-950/40 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              id="ledger-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ledger... (/)"
              className="bg-zinc-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500 text-white w-full md:w-56"
            />
          </div>

          {/* Trash Toggle */}
          <button
            onClick={() => {
              setShowTrash(!showTrash);
              playChime('info');
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showTrash
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {showTrash ? 'Open Active Ledger' : 'Open Trash Bin'}
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="flex gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Type Select */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Date Select */}
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Past Week</option>
            <option value="month">This Month</option>
            <option value="month30">Past 30 Days</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Value: High-Low</option>
            <option value="amount-asc">Value: Low-High</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-inner"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : sortedTxs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-zinc-950/20 flex flex-col items-center justify-center space-y-4">
          <Briefcase className="h-8 w-8 text-zinc-700 animate-bounce" />
          <h4 className="text-sm font-bold text-zinc-400">
            {showTrash ? 'Trash Bin is empty' : 'No transactions recorded yet'}
          </h4>
          <p className="text-zinc-600 max-w-sm text-center">
            {showTrash
              ? 'Excellent! You do not have recently deleted or soft-deleted records.'
              : 'Add an income or expense transaction using the form above, or quick start using the demo company generator.'}
          </p>
          {!showTrash && (
            <button
              onClick={handleLoadDemoData}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-extrabold text-xs h-8.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-90 shadow-lg"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Load Ledger Demo Data
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Date</th>
                  <th className="p-4">Client / Vendor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amount (INR)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11.5px]">
                {sortedTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTx(tx);
                      playChime('info');
                    }}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-mono font-bold text-zinc-400">
                      {formatIST(tx.transaction_date, 'dd MMM yyyy')}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white leading-normal">{tx.description || tx.category}</p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 leading-none">
                        <User className="h-2.5 w-2.5" />
                        {tx.metadata?.customer_name || 'Direct Business'}
                      </p>
                    </td>
                    <td className="p-4 text-zinc-400 font-medium">
                      {tx.category || 'General'}
                    </td>
                    <td className="p-4">
                      {tx.metadata?.tags && tx.metadata.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {tx.metadata.tags.slice(0, 2).map((t: string) => (
                            <span key={t} className="bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5 text-[8.5px] font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-700 font-mono">—</span>
                      )}
                    </td>
                    <td className="p-4 uppercase font-mono text-[10px] text-zinc-400">
                      {tx.metadata?.payment_mode || 'upi'}
                      {tx.metadata?.gst_applicable && (
                        <span className="ml-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[8px] font-extrabold text-cyan-400 tracking-wider">
                          GST
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {(() => {
                        const status = tx.metadata?.payment_status || 'completed';
                        return (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border leading-none tracking-wider uppercase inline-block ${
                            status === 'completed'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : status === 'pending'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className={`p-4 text-right font-extrabold font-mono text-[12px] ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} {formatINR(Number(tx.amount_inr))}
                    </td>
                    <td className="p-4 text-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {showTrash ? (
                        <>
                          <button
                            onClick={(e) => handleRestore(tx.id, e)}
                            className="inline-flex h-7 px-2.5 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all font-bold cursor-pointer"
                            title="Restore transaction"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Restore
                          </button>
                          <button
                            onClick={(e) => handlePermanentDelete(tx.id, e)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Permanently purge transaction"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditModal(tx)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title="Edit transaction parameters"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleSoftDelete(tx.id, e)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Move to trash bin"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Slide-over sheet Drawer */}
      <AnimatePresence>
        {selectedTx && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => setSelectedTx(null)} />
            
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 270, damping: 24 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md border-l border-white/10 bg-zinc-950/95 backdrop-blur-xl p-6 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Receipt Ledger Slip</h4>
                      <p className="text-[10px] text-zinc-500">ID: #{selectedTx.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTx(null);
                      playChime('info');
                    }}
                    className="rounded-lg p-1 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Amount display */}
                <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">
                    Total Amount ({selectedTx.type})
                  </span>
                  <p className={`text-2xl font-extrabold font-mono ${
                    selectedTx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {selectedTx.type === 'income' ? '+' : '-'} {formatINR(Number(selectedTx.amount_inr))}
                  </p>
                  {selectedTx.metadata?.recurring_interval && selectedTx.metadata.recurring_interval !== 'none' && (
                    <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[8.5px] font-extrabold text-violet-400 tracking-wider uppercase inline-block">
                      {selectedTx.metadata.recurring_interval} billing
                    </span>
                  )}
                </div>

                {/* Billing metadata fields */}
                <div className="space-y-3.5 text-[11px] leading-relaxed">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Filing Date:</span>
                    <span className="text-white font-mono">{selectedTx.transaction_date}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Operation Type:</span>
                    <span className="text-white capitalize">{selectedTx.type}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Category Ledger:</span>
                    <span className="text-white">{selectedTx.category || 'General'}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Reconciliation:</span>
                    <span className="text-white uppercase font-mono">{selectedTx.metadata?.payment_mode || 'upi'}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Status Slip:</span>
                    <span className="text-white capitalize">{selectedTx.metadata?.payment_status || 'completed'}</span>
                  </div>

                  {/* Customer Block */}
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3.5 space-y-2.5">
                    <h5 className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-cyan-400" />
                      Client Details
                    </h5>
                    <div className="space-y-1">
                      <p className="font-bold text-white">{selectedTx.metadata?.customer_name || 'Direct Business Client'}</p>
                      <p className="text-[10px] text-zinc-500">Link ID: {selectedTx.metadata?.customer_id || 'none'}</p>
                    </div>
                  </div>

                  {/* GST calculations details */}
                  {selectedTx.metadata?.gst_applicable && (
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-2">
                      <h5 className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Landmark className="h-3.5 w-3.5" />
                        GST Breakdown Summary
                      </h5>
                      <div className="space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">GST Slab Rate:</span>
                          <span className="text-white font-bold">{selectedTx.metadata?.gst_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">CGST Component:</span>
                          <span className="text-zinc-400">{formatINR(selectedTx.metadata?.cgst_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">SGST Component:</span>
                          <span className="text-zinc-400">{formatINR(selectedTx.metadata?.sgst_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">IGST Component:</span>
                          <span className="text-zinc-400">{formatINR(selectedTx.metadata?.igst_amount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags list */}
                  {selectedTx.metadata?.tags && selectedTx.metadata.tags.length > 0 && (
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Tags className="h-3.5 w-3.5 text-zinc-500" />
                      <div className="flex flex-wrap gap-1">
                        {selectedTx.metadata.tags.map((t: string) => (
                          <span key={t} className="bg-zinc-900 border border-white/10 rounded-full px-2 py-0.5 text-[9px] font-mono text-zinc-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons inside drawer */}
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button
                  onClick={() => openEditModal(selectedTx)}
                  className="bg-white text-black hover:bg-zinc-200 font-extrabold flex-1 h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Slip
                </button>
                <button
                  onClick={() => handleSoftDelete(selectedTx.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold flex-1 h-9 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Move to Trash
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Edit modal popup */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Edit2 className="h-4 w-4 text-cyan-400" />
                  Edit Ledger Entry
                </h4>
                <button
                  onClick={() => {
                    setEditingTx(null);
                    playChime('info');
                  }}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={submitEdit} className="space-y-4 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-zinc-500">Amount (INR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="bg-zinc-900 border-white/10 h-8.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-zinc-500">Date</Label>
                    <Input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="bg-zinc-900 border-white/10 h-8.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-zinc-500">Category</Label>
                  <Input
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="bg-zinc-900 border-white/10 h-8.5"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-zinc-500">Description</Label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-zinc-900 border-white/10 h-8.5"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-zinc-500">Payment Mode</Label>
                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-zinc-300 h-8.5 cursor-pointer"
                    >
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="card">Debit/Credit Card</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-zinc-500">Payment Status</Label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-zinc-300 h-8.5 cursor-pointer"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTx(null);
                      playChime('info');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs h-8.5 px-4 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-extrabold rounded-xl text-xs h-8.5 px-4 cursor-pointer shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
