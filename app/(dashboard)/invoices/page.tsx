'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/use-workspace';
import { formatINR } from '@/lib/utils';
import { playChime } from '@/lib/sound';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureGateShield } from '@/components/ui/feature-gate-shield';
import { FileText, Plus, Send, Download, Percent, AlertCircle, CheckCircle, Trash } from 'lucide-react';
import { toast } from 'sonner';
import type { Invoice } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

async function fetchInvoices(businessId: string): Promise<Invoice[]> {
  const { data, error } = await createClient()
    .from('invoices')
    .select('*')
    .eq('business_id', businessId)
    .order('invoice_number', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Invoice[];
}

export default function InvoicesPage() {
  const { activeId } = useWorkspace();
  const [payingId, setPayingId] = React.useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);
  const { data, isLoading } = useSWR(
    activeId ? ['invoices', activeId] : null,
    () => fetchInvoices(activeId!)
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [isInterState, setIsInterState] = useState(false);
  
  // Line items state
  const [items, setItems] = useState<{ desc: string; qty: number; price: number; hsn: string }[]>([
    { desc: 'AI Growth Consulting', qty: 1, price: 25000, hsn: '998311' }
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemHsn, setNewItemHsn] = useState('998311');

  const addItem = () => {
    if (!newItemDesc.trim() || !newItemPrice) return;
    setItems([
      ...items,
      { desc: newItemDesc.trim(), qty: Number(newItemQty), price: Number(newItemPrice), hsn: newItemHsn }
    ]);
    setNewItemDesc('');
    setNewItemPrice('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Compute GST aggregates
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cgst = isInterState ? 0 : subtotal * 0.09;
  const sgst = isInterState ? 0 : subtotal * 0.09;
  const igst = isInterState ? subtotal * 0.18 : 0;
  const total = subtotal + cgst + sgst + igst;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || items.length === 0) {
      toast.error('Add customer details and at least one item.');
      return;
    }

    try {
      const supabase = createClient();
      
      // 1. Resolve or create customer
      const { data: cust, error: custErr } = await supabase
        .from('customers')
        .insert({
          business_id: activeId!,
          name: customerName.trim(),
          email: customerEmail.trim() || null,
          phone: customerPhone.trim() || null,
          gstin: customerGstin.trim() || null,
        })
        .select('id')
        .single();

      if (custErr) throw custErr;

      // 2. Generate sequential prefix invoice number
      const sequenceNum = (data?.length ?? 0) + 1;
      const invoiceNumber = `VYR-2026-${String(sequenceNum).padStart(5, '0')}`;

      // 3. Insert Invoice record
      const { error: invErr } = await supabase
        .from('invoices')
        .insert({
          business_id: activeId!,
          customer_id: cust.id,
          invoice_number: invoiceNumber,
          status: 'sent',
          issue_date: new Date().toISOString().slice(0, 10),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          subtotal_inr: subtotal,
          cgst_inr: cgst,
          sgst_inr: sgst,
          igst_inr: igst,
          total_inr: total,
          line_items: items.map(i => ({
            description: i.desc,
            quantity: i.qty,
            unit_price_inr: i.price,
            gst_rate: 18,
            hsn_sac: i.hsn
          })),
          is_inter_state: isInterState,
        });

      if (invErr) throw invErr;

      mutate(['invoices', activeId]);
      setShowCreateModal(false);
      
      // Reset fields
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerGstin('');
      setItems([{ desc: 'AI Growth Consulting', qty: 1, price: 25000, hsn: '998311' }]);

      toast.success(`Invoice ${invoiceNumber} created and registered successfully!`);
    } catch (err) {
      toast.error('Failed to create GST invoice.');
    }
  };

  const handleSimulateDownload = (invNum: string) => {
    toast.success(`GST Invoice PDF receipt "${invNum}.pdf" downloaded successfully!`);
  };

  const handleSimulateWhatsAppShare = (invNum: string, totalVal: number) => {
    toast.success(`WhatsApp receipt for ${invNum} of ${formatINR(totalVal)} dispatched via WATI API!`);
  };

  const handleMarkAsPaid = async (inv: Invoice) => {
    if (inv.status === 'paid') {
      toast.info('Invoice already paid.');
      return;
    }
    try {
      const supabase = createClient();
      
      // 1. Update Invoice status to paid
      const { error: invErr } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', inv.id);
      if (invErr) throw invErr;

      // 2. Fetch customer details
      const { data: cust } = await supabase
        .from('customers')
        .select('name')
        .eq('id', inv.customer_id)
        .single();
      const customerName = cust?.name || 'Client';

      // 3. Automate: Insert corresponding income transaction
      const { error: txErr } = await supabase
        .from('transactions')
        .insert({
          business_id: activeId!,
          type: 'income',
          amount_inr: Number(inv.total_inr),
          description: `GST Invoice payment: ${inv.invoice_number}`,
          category: 'Consulting',
          transaction_date: new Date().toISOString().slice(0, 10),
          metadata: {
            invoice_id: inv.id,
            payment_mode: 'bank_transfer',
            payment_status: 'completed',
            gst_applicable: true,
            gst_rate: 18,
            cgst_amount: Number(inv.cgst_inr),
            sgst_amount: Number(inv.sgst_inr),
            igst_amount: Number(inv.igst_inr),
            is_inter_state: inv.is_inter_state,
            customer_id: inv.customer_id,
            customer_name: customerName,
          },
        });
      if (txErr) throw txErr;

      mutate(['invoices', activeId], (current) => {
  if (!current) return current;
  return current.map((i: Invoice) => i.id === inv.id ? { ...i, status: 'paid' } : i);
}, false);
      
      // Play native audio success sweep
      const playChimeModule = await import('@/lib/sound');
      playChimeModule.playChime('success');

      toast.success(`Invoice ${inv.invoice_number} successfully paid! Ledger income entry logged dynamically.`);
    } catch {
      toast.error('Failed to update invoice payment status.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            GST & Invoices
          </h1>
          <p className="text-xs text-zinc-500">
            Generate sequential bills, calculate CGST/SGST/IGST, and share PDF receipts on WhatsApp.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-black hover:bg-zinc-200 rounded-xl text-xs px-4 h-9 gap-1.5 font-bold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <FeatureGateShield feature="gst_automation" requiredPlan="Starter">
        {/* Create Invoice Drawer */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    New GST Invoice
                  </h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white text-xs">
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-6 text-xs">
                  {/* Customer Information */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-zinc-300">1. Customer Information</h5>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-zinc-500">Business / Client Name</label>
                        <Input
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Vyron Tech Private Ltd"
                          className="bg-zinc-900 border-white/10 h-8.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500">GSTIN Number (optional)</label>
                        <Input
                          value={customerGstin}
                          onChange={(e) => setCustomerGstin(e.target.value)}
                          placeholder="e.g. 27AAAAA1111A1Z1"
                          className="bg-zinc-900 border-white/10 h-8.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500">Email Address</label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="client@vyron.ai"
                          className="bg-zinc-900 border-white/10 h-8.5 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500">Phone Number (WATI notification)</label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="bg-zinc-900 border-white/10 h-8.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-zinc-300">2. Service & Line Items</h5>
                    
                    <div className="border border-white/5 bg-white/5 rounded-xl p-4 space-y-3">
                      <div className="grid gap-2 sm:grid-cols-4 items-end">
                        <div className="space-y-1">
                          <label className="text-zinc-500">Description</label>
                          <Input
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            placeholder="Consultancy Services"
                            className="bg-zinc-900 border-white/5 h-8 text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-500">HSN/SAC Code</label>
                          <Input
                            value={newItemHsn}
                            onChange={(e) => setNewItemHsn(e.target.value)}
                            placeholder="998311"
                            className="bg-zinc-900 border-white/5 h-8 text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-500">Unit Price (INR)</label>
                          <Input
                            type="number"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(e.target.value)}
                            placeholder="15000"
                            className="bg-zinc-900 border-white/5 h-8 text-[11px]"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addItem}
                          className="bg-white text-black hover:bg-zinc-200 h-8 text-[11px] font-bold rounded-lg"
                        >
                          Add Item
                        </Button>
                      </div>

                      {/* Display active list */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-white/5">
                            <div className="space-y-0.5">
                              <p className="font-bold text-white">{item.desc}</p>
                              <p className="text-[10px] text-zinc-500">HSN: {item.hsn} · Qty: {item.qty} · Rate: {formatINR(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-zinc-300">{formatINR(item.price * item.qty)}</span>
                              <button onClick={() => removeItem(idx)} className="text-zinc-500 hover:text-red-400">
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculations & GST Location */}
                  <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-white/5">
                    {/* Tax Location Toggles */}
                    <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3">
                      <h6 className="font-bold text-zinc-300 flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5 text-cyan-400" />
                        GST Location Rule
                      </h6>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            checked={!isInterState}
                            onChange={() => setIsInterState(false)}
                            className="accent-cyan-400"
                          />
                          <span>Intra-state (CGST 9% + SGST 9%)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            checked={isInterState}
                            onChange={() => setIsInterState(true)}
                            className="accent-cyan-400"
                          />
                          <span>Inter-state (IGST 18%)</span>
                        </label>
                      </div>
                    </div>

                    {/* Tax Calculations */}
                    <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Subtotal:</span>
                        <span className="text-white font-bold">{formatINR(subtotal)}</span>
                      </div>
                      {!isInterState ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">CGST (9%):</span>
                            <span className="text-zinc-400 font-medium">{formatINR(cgst)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">SGST (9%):</span>
                            <span className="text-zinc-400 font-medium">{formatINR(sgst)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">IGST (18%):</span>
                          <span className="text-zinc-400 font-medium">{formatINR(igst)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-white/5 pt-2 text-sm">
                        <span className="font-bold text-white">Invoice Total:</span>
                        <span className="font-extrabold text-cyan-400">{formatINR(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-xl text-xs h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold rounded-xl text-xs h-9 px-4"
                    >
                      Register GST Invoice
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoices List Display */}
        {isLoading && <Skeleton className="h-32 w-full rounded-2xl" />}
        {!isLoading && !data?.length ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-zinc-500 flex flex-col items-center justify-center space-y-2.5 bg-zinc-950/40 backdrop-blur-xl">
            <AlertCircle className="h-8 w-8 text-zinc-600 animate-pulse" />
            <h6 className="text-sm font-bold text-zinc-400">No invoices generated yet</h6>
            <p className="text-xs max-w-sm">
              Click the &quot;Create Invoice&quot; button above to formulate professional GST compliant client invoices.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">GST Value</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.map((inv) => {
                    const gstTotal = Number(inv.cgst_inr) + Number(inv.sgst_inr) + Number(inv.igst_inr);
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setShowInvoiceModal(true);
                        }}
                      >
                        <td className="p-4 font-bold text-white font-mono">{inv.invoice_number}</td>
                        <td className="p-4 text-zinc-400">{inv.issue_date}</td>
                        <td className="p-4 capitalize">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            inv.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-300">{formatINR(Number(inv.subtotal_inr))}</td>
                        <td className="p-4 text-zinc-400">{formatINR(gstTotal)}</td>
                        <td className="p-4 font-bold text-cyan-400">{formatINR(Number(inv.total_inr))}</td>
                        <td className="p-4 text-right space-x-2">
                          {inv.status !== 'paid' ? (
                            <motion.button
                              whileHover={{ scale: 1.02, boxShadow: '0 0 8px rgba(0,255,255,0.6)' }}
                              whileTap={{ scale: 0.94 }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                playChime('info');
                                setPayingId(inv.id);
                                await handleMarkAsPaid(inv);
                                setPayingId(null);
                                playChime('success');
                              }}
                              disabled={payingId === inv.id}
                              className="inline-flex h-7 px-2 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-[10px] font-bold cursor-pointer"
                              title="Mark as Paid"
                            >
                              {payingId === inv.id ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                  className="h-3.5 w-3.5 mr-1 border border-cyan-400 rounded-full"
                                />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              )}
                              {payingId === inv.id ? 'Processing…' : 'Pay'}
                            </motion.button>
                          ) : (
                            <button
                              disabled
                              className="inline-flex h-7 px-2 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 cursor-not-allowed"
                              title="Already Paid"
                            >
                              Paid
                            </button>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); handleSimulateDownload(inv.invoice_number); }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSimulateWhatsAppShare(inv.invoice_number, Number(inv.total_inr)); }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </FeatureGateShield>

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-950 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-lg font-bold text-white">Invoice {selectedInvoice.invoice_number}</h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-zinc-400 hover:text-white"
                >✕</button>
              </div>
              <p className="text-sm text-zinc-300">Date: {selectedInvoice.issue_date}</p>
              <p className="text-sm text-zinc-300">Status: {selectedInvoice.status}</p>
              <p className="text-sm text-zinc-300">Total: {formatINR(Number(selectedInvoice.total_inr))}</p>
              {/* Add more detailed info as needed */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
