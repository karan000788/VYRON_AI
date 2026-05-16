import { describe, it, expect } from 'vitest';
import { calculateGST, validateGSTIN } from '@/lib/gst/calculate';

describe('GST', () => {
  it('validates GSTIN format', () => {
    expect(validateGSTIN('22AAAAA0000A1Z5')).toBe(true);
    expect(validateGSTIN('invalid')).toBe(false);
  });

  it('calculates CGST/SGST for intra-state', () => {
    const result = calculateGST(
      [{ description: 'Service', quantity: 1, unit_price_inr: 1000, gst_rate: 18 }],
      false
    );
    expect(result.subtotal_inr).toBe(1000);
    expect(result.cgst_inr).toBe(90);
    expect(result.sgst_inr).toBe(90);
    expect(result.igst_inr).toBe(0);
    expect(result.total_inr).toBe(1180);
  });

  it('calculates IGST for inter-state', () => {
    const result = calculateGST(
      [{ description: 'Service', quantity: 1, unit_price_inr: 1000, gst_rate: 18 }],
      true
    );
    expect(result.igst_inr).toBe(180);
    expect(result.cgst_inr).toBe(0);
    expect(result.total_inr).toBe(1180);
  });
});
