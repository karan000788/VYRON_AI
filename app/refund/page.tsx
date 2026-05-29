import { PublicFooter } from '@/components/layout/public-footer';
import { PublicNav } from '@/components/layout/public-nav';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-extrabold">Refund Policy</h1>
        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-sm leading-relaxed text-zinc-400">
          <p>
            Cancel anytime. No refunds on current billing period. Data accessible in read-only for 30 days
            post-cancellation. After 30 days, PII is anonymized per DPDP.
          </p>
          <p className="mt-4">
            For billing or cancellation questions, contact support@vyron.ai. We respond within 24 hours.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
