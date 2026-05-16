import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, BarChart3, FileText } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export default function LandingPage() {
  const trialHref = isSupabaseConfigured() ? '/signup' : '/setup';
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-vyron-gradient" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">
          VYRON AI
        </span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href={trialHref}>
            <Button>Start free trial</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-400">
          Your AI Workforce & Growth Operating System
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Run your Indian business with{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            AI, CRM & GST billing
          </span>{' '}
          in one place
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          Finance tracking, lead management, GST-compliant invoices, and an AI copilot —
          built for agencies, freelancers, and growing startups.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href={trialHref}>
            <Button size="lg" className="gap-2">
              7-day free trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: 'AI Copilot',
              desc: 'Business summaries, health scores, and daily briefings with strict credit controls.',
            },
            {
              icon: FileText,
              title: 'GST Invoicing',
              desc: 'CGST/SGST/IGST breakdown, sequential numbering, and branded PDF exports.',
            },
            {
              icon: BarChart3,
              title: 'Growth OS',
              desc: 'Transactions, CRM, campaigns, and reports for real operators — not fake analytics.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl"
            >
              <f.icon className="mb-4 h-8 w-8 text-violet-400" />
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
