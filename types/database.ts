export type MembershipRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'employee'
  | 'accountant';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'payment_failed'
  | 'grace_period'
  | 'suspended'
  | 'cancelled';

export type SubscriptionPlan = 'starter' | 'growth' | 'pro';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'won'
  | 'lost';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  timezone: string;
  locale: string;
  dpdp_consent_at: string | null;
  cookie_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  gstin: string | null;
  logo_url: string | null;
  deleted_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  business_id: string;
  user_id: string;
  role: MembershipRole;
  accepted_at: string | null;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  ai_credits_remaining: number;
  trial_ends_at: string | null;
  grace_period_ends_at: string | null;
  cancelled_at: string | null;
}

export interface Transaction {
  id: string;
  business_id: string;
  type: TransactionType;
  amount_inr: number;
  currency: string;
  category: string | null;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_inr: number;
  gst_rate: number;
  hsn_sac?: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal_inr: number;
  cgst_inr: number;
  sgst_inr: number;
  igst_inr: number;
  total_inr: number;
  line_items: InvoiceLineItem[];
  is_inter_state: boolean;
  pdf_url: string | null;
}

export interface Lead {
  id: string;
  business_id: string;
  title: string;
  status: LeadStatus;
  source: string | null;
  value_inr: number | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstin: string | null;
}

export interface Notification {
  id: string;
  business_id: string;
  user_id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AiUsageLog {
  id: string;
  business_id: string;
  model: string;
  task_type: string;
  credits_used: number;
  created_at: string;
}
