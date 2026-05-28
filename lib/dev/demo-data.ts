'use server';

import { createClient } from '@/lib/supabase/server';

const isDev = process.env.NEXT_PUBLIC_DEV_BILLING_MODE === 'true';

export async function generateDemoData(businessId: string) {
  if (!isDev) throw new Error('DEV_BILLING_MODE is disabled.');
  const supabase = await createClient();
  
  // 1. Generate Transactions
  const transactions = [
    { business_id: businessId, type: 'income', amount_inr: 45000, category: 'consulting', description: 'Monthly Retainer - VYRON Tech', status: 'completed', transaction_date: new Date().toISOString().slice(0, 10) },
    { business_id: businessId, type: 'income', amount_inr: 12500, category: 'product_sale', description: 'Student Coursework Bundle', status: 'completed', transaction_date: new Date().toISOString().slice(0, 10) },
    { business_id: businessId, type: 'expense', amount_inr: 8500, category: 'software', description: 'Overhead Cloud Infrastructure', status: 'completed', transaction_date: new Date().toISOString().slice(0, 10) },
  ];

  await supabase.from('transactions').insert(transactions);

  // 2. Generate Leads
  const leads = [
    { business_id: businessId, name: 'Karan gaming store', email: 'karan@gamingworld.in', status: 'hot', deal_value: 95000, notes: 'Highly interested in automated WhatsApp WATI alerts stream.' },
    { business_id: businessId, name: 'Mumbai Retail Outlets', email: 'operations@retailmumbai.co.in', status: 'warm', deal_value: 45000, notes: 'Requested GST invoicing billing flow customizations.' },
    { business_id: businessId, name: 'Devarsh Freelancing', email: 'contact@devarsh.dev', status: 'cold', deal_value: 12000, notes: 'Follow-up regarding Student course discount planner.' },
  ];

  await supabase.from('leads').insert(leads);

  // 3. Generate Invoices
  const invoices = [
    { business_id: businessId, client_name: 'Karan Gaming Store', client_email: 'billing@gamingworld.in', amount_inr: 15000, status: 'paid', gst_rate: 18, is_interstate: false, prefix: 'VYR-2026-00001', invoice_number: '00001', due_date: new Date().toISOString().slice(0, 10) },
    { business_id: businessId, client_name: 'Mumbai Retail Outlets', client_email: 'procure@mumbairetail.in', amount_inr: 28000, status: 'sent', gst_rate: 18, is_interstate: true, prefix: 'VYR-2026-00002', invoice_number: '00002', due_date: new Date().toISOString().slice(0, 10) },
  ];

  await supabase.from('invoices').insert(invoices);

  return { success: true };
}

export async function clearDemoData(businessId: string) {
  if (!isDev) throw new Error('DEV_BILLING_MODE is disabled.');
  const supabase = await createClient();

  await supabase.from('transactions').delete().eq('business_id', businessId);
  await supabase.from('leads').delete().eq('business_id', businessId);
  await supabase.from('invoices').delete().eq('business_id', businessId);

  return { success: true };
}
