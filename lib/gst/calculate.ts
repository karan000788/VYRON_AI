import type { InvoiceLineItem } from '@/types/database';

export interface GSTBreakdown {
  subtotal_inr: number;
  cgst_inr: number;
  sgst_inr: number;
  igst_inr: number;
  total_inr: number;
}

export function validateGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstin.toUpperCase()
  );
}

export function calculateGST(
  lineItems: InvoiceLineItem[],
  isInterState: boolean
): GSTBreakdown {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  for (const item of lineItems) {
    const lineSubtotal = round2(item.quantity * item.unit_price_inr);
    subtotal += lineSubtotal;
    const tax = round2(lineSubtotal * (item.gst_rate / 100));

    if (isInterState) {
      totalIgst += tax;
    } else {
      totalCgst += round2(tax / 2);
      totalSgst += round2(tax / 2);
    }
  }

  subtotal = round2(subtotal);
  totalCgst = round2(totalCgst);
  totalSgst = round2(totalSgst);
  totalIgst = round2(totalIgst);

  return {
    subtotal_inr: subtotal,
    cgst_inr: totalCgst,
    sgst_inr: totalSgst,
    igst_inr: totalIgst,
    total_inr: round2(subtotal + totalCgst + totalSgst + totalIgst),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
