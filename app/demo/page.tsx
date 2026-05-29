import Link from 'next/link';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicNav } from '@/components/layout/public-nav';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';

const leads = [
  ['Aarav Textiles', 'hot', 85000],
  ['Mumbai Retail Co', 'warm', 45000],
  ['Surat Traders', 'cold', 18000],
  ['Delta Media', 'closed', 120000],
  ['Karan Gaming', 'warm', 32000],
];

const invoices = [
  ['INV-000101', 'Aarav Textiles', 85000, 'sent'],
  ['INV-000102', 'Delta Media', 120000, 'paid'],
  ['INV-000103', 'Karan Gaming', 32000, 'overdue'],
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PublicNav />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-cyan-100">This is a demo workspace. Sign up to create your real workspace.</p>
          <Link href="/signup">
            <Button>Start Free Trial</Button>
          </Link>
        </div>
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
          Demo data only: 5 sample leads, 3 sample invoices, 1 AI briefing card, and 1 revenue chart.
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold">Demo Revenue Chart</h2>
            <div className="flex h-56 items-end gap-3">
              {[42000, 68000, 58000, 96000, 122000, 147000].map((amount, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t bg-gradient-to-t from-cyan-500 to-violet-500" style={{ height: `${amount / 1600}px` }} />
                  <span className="text-[10px] text-zinc-500">M{idx + 1}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <h2 className="mb-2 text-lg font-bold">AI Briefing</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Demo briefing: revenue is trending upward, two invoices need follow-up, and hot leads should be prioritized today.
            </p>
          </section>
          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <h2 className="mb-4 text-lg font-bold">Sample Leads</h2>
            <div className="space-y-3">
              {leads.map(([name, status, value]) => (
                <div key={String(name)} className="flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-cyan-400">{status} · {formatINR(Number(value))}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold">Sample Invoices</h2>
            <div className="space-y-3">
              {invoices.map(([id, client, amount, status]) => (
                <div key={String(id)} className="grid grid-cols-4 gap-2 text-sm">
                  <span>{id}</span>
                  <span>{client}</span>
                  <span>{formatINR(Number(amount))}</span>
                  <span className="capitalize text-zinc-400">{status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
