'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { playChime } from '@/lib/sound';
import { Plus, Users, Landmark, FileText, Percent, RefreshCw, Sparkles, Check, ChevronDown } from 'lucide-react';
import type { TransactionType } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { activeId } = useWorkspace();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Consulting');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  // Business GSTIN
  const [bizGstin, setBizGstin] = useState('');

  // Customer linkages
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [addNewCustomer, setAddNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');

  // GST specifications
  const [gstApplicable, setGstApplicable] = useState(false);
  const [gstRate, setGstRate] = useState<number>(18);
  const [isInclusive, setIsInclusive] = useState(false);
  const [isInterState, setIsInterState] = useState(false);

  // Tags and recurring
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [recurringInterval, setRecurringInterval] = useState<'none' | 'weekly' | 'monthly'>('none');

  // Load existing customers & Business GSTIN
  useEffect(() => {
    async function loadData() {
      if (!activeId) return;
      const supabase = createClient();
      
      // Fetch customers
      const { data: custs } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', activeId);
      setCustomers(custs || []);

      // Fetch business GSTIN
      const { data: biz } = await supabase
        .from('businesses')
        .select('gstin')
        .eq('id', activeId)
        .single();
      if (biz?.gstin) {
        setBizGstin(biz.gstin);
      }
    }
    loadData();
  }, [activeId]);

  // Form Auto-save Draft Engine (runs every 3 seconds)
  useEffect(() => {
    if (!activeId) return;
    const draftKey = `vyron_draft_tx_${activeId}`;

    // Try restoring draft on load
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        setType(d.type || 'expense');
        setAmount(d.amount || '');
        setDescription(d.description || '');
        setCategory(d.category || 'Consulting');
        setDate(d.date || new Date().toISOString().slice(0, 10));
        setGstApplicable(!!d.gstApplicable);
        setGstRate(d.gstRate || 18);
        setIsInclusive(!!d.isInclusive);
        setIsInterState(!!d.isInterState);
        setRecurringInterval(d.recurringInterval || 'none');
        setSelectedTags(d.selectedTags || []);
        setSelectedCustomerId(d.selectedCustomerId || '');
        
        toast.info('Form progress restored from auto-saved draft!', {
          duration: 3000,
        });
      } catch (e) {
        console.warn('Failed to parse form draft:', e);
      }
    }

    // Interval to save draft
    const timer = setInterval(() => {
      const draftObj = {
        type,
        amount,
        description,
        category,
        date,
        gstApplicable,
        gstRate,
        isInclusive,
        isInterState,
        recurringInterval,
        selectedTags,
        selectedCustomerId,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftObj));
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [
    activeId,
    type,
    amount,
    description,
    category,
    date,
    gstApplicable,
    gstRate,
    isInclusive,
    isInterState,
    recurringInterval,
    selectedTags,
    selectedCustomerId,
  ]);

  // GSTIN State Detection & validation
  useEffect(() => {
    const gstinToParse = addNewCustomer ? newCustGstin : customers.find(c => c.id === selectedCustomerId)?.gstin || '';
    if (gstinToParse.trim().length === 15) {
      const customerStatePrefix = gstinToParse.slice(0, 2);
      const bizStatePrefix = bizGstin.slice(0, 2);

      if (bizStatePrefix && customerStatePrefix) {
        // If state prefixes don't match -> Inter-state (IGST)
        const isInter = customerStatePrefix !== bizStatePrefix;
        setIsInterState(isInter);
        
        toast.info(`GST state code ${customerStatePrefix} detected. Auto-toggled to ${isInter ? 'Inter-state IGST' : 'Intra-state CGST+SGST'}!`, {
          duration: 2500
        });
      }
    }
  }, [newCustGstin, selectedCustomerId, bizGstin, addNewCustomer, customers]);

  // Clear draft from localStorage
  const clearDraft = () => {
    if (activeId) {
      localStorage.removeItem(`vyron_draft_tx_${activeId}`);
    }
  };

  // Math GST calculations
  const parsedAmt = parseFloat(amount) || 0;
  let baseValue = parsedAmt;
  let taxValue = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstApplicable && parsedAmt > 0) {
    const fraction = gstRate / 100;
    if (isInclusive) {
      baseValue = parsedAmt / (1 + fraction);
      taxValue = parsedAmt - baseValue;
    } else {
      baseValue = parsedAmt;
      taxValue = parsedAmt * fraction;
    }

    if (isInterState) {
      igst = taxValue;
    } else {
      cgst = taxValue / 2;
      sgst = taxValue / 2;
    }
  }

  const finalTotal = isInclusive ? parsedAmt : parsedAmt + taxValue;

  // Add tag helper
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !selectedTags.includes(tag)) {
        setSelectedTags([...selectedTags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== t));
  };

  // Submit transaction
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;

    // Strict Accounting Valdation Layer
    if (parsedAmt <= 0) {
      toast.error('Transaction amount must be a positive number greater than 0.');
      return;
    }

    const txDate = new Date(date);
    const today = new Date();
    if (txDate > today) {
      toast.error('Accounting constraint: Future-dated payments cannot be recorded in ledger.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      let finalCustId = selectedCustomerId || null;
      let finalCustName = customers.find(c => c.id === selectedCustomerId)?.name || null;

      // 1. If inline Customer creation is active
      if (addNewCustomer && newCustName.trim()) {
        const { data: newCust, error: custErr } = await supabase
          .from('customers')
          .insert({
            business_id: activeId,
            name: newCustName.trim(),
            email: newCustEmail.trim() || null,
            phone: newCustPhone.trim() || null,
            gstin: newCustGstin.trim() || null,
            created_by: user.id,
          })
          .select('id, name')
          .single();

        if (custErr) throw custErr;
        finalCustId = newCust.id;
        finalCustName = newCust.name;
        
        // Refresh local customer switcher
        setCustomers((prev) => [...prev, newCust]);
      }

      // 2. Formulate Transaction Metadata JSONB
      const metadata = {
        payment_mode: 'upi',
        payment_status: 'completed',
        gst_applicable: gstApplicable,
        gst_rate: gstApplicable ? gstRate : 0,
        cgst_amount: gstApplicable ? cgst : 0,
        sgst_amount: gstApplicable ? sgst : 0,
        igst_amount: gstApplicable ? igst : 0,
        is_inter_state: gstApplicable ? isInterState : false,
        customer_id: finalCustId,
        customer_name: finalCustName,
        tags: selectedTags,
        recurring_interval: recurringInterval,
      };

      // 3. Insert transaction
      const { error } = await supabase.from('transactions').insert({
        business_id: activeId,
        type,
        amount_inr: finalTotal,
        description: description.trim() || null,
        category: category === 'Other' ? customCategory.trim() : category,
        transaction_date: date,
        metadata,
        created_by: user.id,
      });

      if (error) throw error;

      // Trigger native chimes audio sweep
      playChime('success');
      toast.success('Transaction registered successfully in ledger!');

      // Reset fields
      setAmount('');
      setDescription('');
      setCustomCategory('');
      setSelectedTags([]);
      setAddNewCustomer(false);
      setNewCustName('');
      setNewCustEmail('');
      setNewCustPhone('');
      setNewCustGstin('');
      setSelectedCustomerId('');

      // Wipe draft
      clearDraft();

      onSuccess?.();
    } catch (err: any) {
      playChime('warning');
      toast.error(err.message || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  }

  // Pre-baked category lists
  const CATEGORIES = type === 'income' 
    ? ['Consulting', 'Product Sale', 'Subscription', 'Service', 'Sponsorship', 'Other']
    : ['Software/SaaS', 'Cloud Hosting', 'Marketing/Ads', 'Office Rent', 'Utilities', 'Salary/Wages', 'Office Supplies', 'Taxes/GST', 'Other'];

  return (
    <form onSubmit={submit} className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 p-5 space-y-6 backdrop-blur-xl">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          Add Transaction
        </h3>
        <div className="flex gap-1.5">
          {(['income', 'expense'] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory(t === 'income' ? 'Consulting' : 'Software/SaaS');
              }}
              className={`text-[10px] uppercase font-mono font-extrabold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                type === t
                  ? t === 'income'
                    ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/25'
                    : 'bg-red-400 text-black shadow-lg shadow-red-400/25'
                  : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        {/* Amount */}
        <div className="space-y-1.5">
          <Label className="text-zinc-500">Transaction Amount (INR)</Label>
          <Input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 25000"
            className="bg-zinc-900/60 border-white/10 text-xs h-9 focus:border-cyan-500"
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label className="text-zinc-500">Transaction Date</Label>
          <Input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-900/60 border-white/10 text-xs h-9"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-zinc-500">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-zinc-200 h-9 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Custom category write-in */}
        {category === 'Other' && (
          <div className="space-y-1.5">
            <Label className="text-zinc-500">Specify Category</Label>
            <Input
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Custom Category name"
              className="bg-zinc-900/60 border-white/10 text-xs h-9"
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-zinc-500">Ledger Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Server hosting fee or client consulting project"
            className="bg-zinc-900/60 border-white/10 text-xs h-9"
          />
        </div>
      </div>

      {/* Customer select dropdown switcher */}
      <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-4">
        <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-cyan-400" />
          Client / Vendor Linkage
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-zinc-500">Link Customer</Label>
            <select
              disabled={addNewCustomer}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-zinc-200 h-9 disabled:opacity-40 cursor-pointer"
            >
              <option value="">Select Existing Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.gstin ? `(${c.gstin.slice(0, 4)}...)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setAddNewCustomer(!addNewCustomer);
                setSelectedCustomerId('');
              }}
              className={`w-full h-9 rounded-xl border transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                addNewCustomer
                  ? 'border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                  : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              {addNewCustomer ? 'Use Existing Contact' : 'Register New Customer'}
            </button>
          </div>
        </div>

        {/* Inline new customer form */}
        <AnimatePresence>
          {addNewCustomer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid gap-3 sm:grid-cols-2 text-xs pt-3 border-t border-white/5 overflow-hidden"
            >
              <div className="space-y-1.5">
                <Label className="text-zinc-500">Contact / Company Name</Label>
                <Input
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Rahul Tech Solutions"
                  className="bg-zinc-900/60 border-white/10 text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-500">GSTIN Number (optional)</Label>
                <Input
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value)}
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  className="bg-zinc-900/60 border-white/10 text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-500">Email ID (optional)</Label>
                <Input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="finance@rahultech.com"
                  className="bg-zinc-900/60 border-white/10 text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-500">Phone Number (optional)</Label>
                <Input
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-zinc-900/60 border-white/10 text-xs h-8.5"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced GST calculator section */}
      <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-amber-400" />
            Tax & GST Calculators
          </h4>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={gstApplicable}
              onChange={() => setGstApplicable(!gstApplicable)}
              className="accent-cyan-400 rounded"
            />
            <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">GST Applicable</span>
          </label>
        </div>

        {/* GST Form Fields */}
        <AnimatePresence>
          {gstApplicable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden pt-1"
            >
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                {/* GST Rate select */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-500">GST Slab Rate (%)</Label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-zinc-200 h-9 cursor-pointer"
                  >
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}% GST slab
                      </option>
                    ))}
                  </select>
                </div>

                {/* Inclusive Toggle */}
                <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isInclusive}
                        onChange={() => setIsInclusive(false)}
                        className="accent-cyan-400"
                      />
                      <span>Exclusive of GST</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={isInclusive}
                        onChange={() => setIsInclusive(true)}
                        className="accent-cyan-400"
                      />
                      <span>Inclusive of GST</span>
                    </label>
                  </div>
                </div>

                {/* State Rules toggle */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-zinc-500">GST Filing Rule</Label>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isInterState}
                        onChange={() => setIsInterState(false)}
                        className="accent-cyan-400"
                      />
                      <span>Intra-state (CGST {gstRate / 2}% + SGST {gstRate / 2}%)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={isInterState}
                        onChange={() => setIsInterState(true)}
                        className="accent-cyan-400"
                      />
                      <span>Inter-state (IGST {gstRate}%)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Dynamic calculations display box */}
              {parsedAmt > 0 && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 text-xs font-mono space-y-1.5">
                  <h6 className="font-bold text-cyan-400 flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    GST Mathematical Breakdown
                  </h6>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Base Net Price:</span>
                    <span className="text-white font-bold">{formatINR(baseValue)}</span>
                  </div>
                  {!isInterState ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">CGST ({gstRate / 2}%):</span>
                        <span className="text-zinc-400">{formatINR(cgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SGST ({gstRate / 2}%):</span>
                        <span className="text-zinc-400">{formatINR(sgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IGST ({gstRate}%):</span>
                      <span className="text-zinc-400">{formatINR(igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/5 pt-1.5 text-[13px]">
                    <span className="font-extrabold text-white">Gross Total:</span>
                    <span className="font-extrabold text-cyan-400">{formatINR(finalTotal)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tags and Recurring */}
      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        {/* Recurring */}
        <div className="space-y-1.5">
          <Label className="text-zinc-500">Recurring Schedule</Label>
          <select
            value={recurringInterval}
            onChange={(e) => setRecurringInterval(e.target.value as any)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors text-zinc-200 h-9 cursor-pointer"
          >
            <option value="none">One-off Payment</option>
            <option value="weekly">Every Week (Recurring)</option>
            <option value="monthly">Every Month (Recurring)</option>
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-zinc-500">Transaction Tags (Press Enter)</Label>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="e.g. office, software"
            className="bg-zinc-900/60 border-white/10 text-xs h-9"
          />
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {selectedTags.map((t) => (
                <span
                  key={t}
                  onClick={() => removeTag(t)}
                  className="bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono cursor-pointer transition-all"
                >
                  #{t} ×
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form CTA Buttons */}
      <div className="flex justify-end gap-2.5 pt-3 border-t border-white/5">
        <Button
          type="submit"
          disabled={loading || parsedAmt <= 0}
          className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-extrabold rounded-xl text-xs h-9.5 px-6 cursor-pointer shadow-lg hover:opacity-90 shadow-cyan-500/15"
        >
          {loading ? 'Saving to Ledger…' : 'Register Transaction'}
        </Button>
      </div>
    </form>
  );
}
