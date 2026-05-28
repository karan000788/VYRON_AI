'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  FileText, 
  Bot, 
  MessageSquare, 
  Target, 
  ShieldCheck, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
  {
    name: 'Free Trial',
    price: '₹0',
    duration: '7 Days',
    desc: 'Perfect for exploring the unified business cockpit.',
    features: [
      'Basic CRM & Transactions',
      '1 Workspace integration',
      '20 monthly AI Credits',
      'Standard invoice builder',
      'No WhatsApp automation',
      'No AI Forecasting',
    ],
    cta: 'Start Free Trial',
    popular: false,
    color: 'border-white/5 bg-zinc-950/40',
  },
  {
    name: 'Starter',
    price: '₹999',
    duration: '/month',
    desc: 'Designed for single-operator startups and freelancers.',
    features: [
      'AI Daily Briefing summaries',
      'Basic GST invoice compliant billing',
      'Leads Pipeline tracking',
      '500 monthly AI Credits',
      'English Voice Assistant STT',
      'Email alert notifications',
    ],
    cta: 'Upgrade to Starter',
    popular: false,
    color: 'border-cyan-500/20 bg-cyan-950/5',
  },
  {
    name: 'Growth',
    price: '₹1999',
    duration: '/month',
    desc: 'Best for growing service agencies & Indian retailers.',
    features: [
      'Everything in Starter PLUS:',
      'WhatsApp automation & WATI integration',
      'AI Lead Scoring & CRM metrics',
      '2,000 monthly AI Credits',
      'AI Marketing copy builder',
      'Advanced SVG Analytics charts',
      'Up to 5 team members capacity',
    ],
    cta: 'Upgrade to Growth',
    popular: true,
    color: 'border-violet-500/30 bg-violet-950/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]',
  },
  {
    name: 'Pro',
    price: '₹2999',
    duration: '/month',
    desc: 'For elite operators seeking complete profit automation.',
    features: [
      'Everything in Growth PLUS:',
      'AI Business Coach expert chats',
      'Multilingual Voice Assistant',
      '10,000 monthly AI Credits',
      'Linear AI Growth Forecasting',
      'DPDP compliance & auditing logs',
      'Unlimited workspace profiles',
    ],
    cta: 'Upgrade to Pro',
    popular: false,
    color: 'border-fuchsia-500/20 bg-fuchsia-950/5',
  },
];

const FAQS = [
  {
    q: 'How does the AI credits system calculate usage?',
    a: 'Each AI interaction (Business Coach dialogue, Lead scoring draft, or Marketing copy compile) consumes a small volume of credits from your monthly pool. Starter plan gets 500, Growth gets 2,000, and Pro gets 10,000. Balance checks are live, and credits renew every 30 days.',
  },
  {
    q: 'What is DPDP compliance and how does it protect my local client data?',
    a: 'The Digital Personal Data Protection (DPDP) Act is India\'s comprehensive data privacy framework. VYRON AI maintains strict database constraints, allowing you to instantly export audit logs, purge analytical transaction data, and log consent records.',
  },
  {
    q: 'Can I integrate my official business WhatsApp API using WATI?',
    a: 'Yes! Subscribing to the Growth or Pro plan unlocks a dedicated WhatsApp automation dock. Simply map your WATI Auth token and trigger automated client reminders, festival discount campaigns, and PDF invoice shares directly.',
  },
  {
    q: 'Does the voice recognition system understand Hindi and Gujarati?',
    a: 'Yes, the advanced AI Voice Assistant features speech-to-text recognition modules supporting Indian English, Hindi (हिंदी), and Gujarati (ગુજરાતી) to make prompt commands highly accessible.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden relative">
      {/* Space gradient glows */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-[140px] pointer-events-none" />
      
      {/* Header Visual Bar */}
      <header className="relative z-10 mx-auto max-w-6xl flex items-center justify-between px-6 py-6 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl">
        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-xl font-extrabold text-transparent tracking-tight">
          VYRON AI
        </span>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white text-xs">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-black hover:bg-zinc-200 text-xs font-bold px-4 h-8.5 rounded-xl">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Visual Area */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 text-center space-y-12">
        <div className="space-y-4">
          <p className="mx-auto max-w-fit rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Sparkles className="h-3 w-3" />
            AI Business Operating System
          </p>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            Run your Indian enterprise on{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              AI CRM & GST Billing
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 leading-relaxed">
            Automate invoice payment reminders via WhatsApp, score leads with conversion metrics, audit margins, and run linear AI growth forecasting. Built for agencies, startups, and traders.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 rounded-xl px-6 font-bold text-sm gap-2 h-11 shadow-lg shadow-cyan-500/15">
              Start 7-Day Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-white rounded-xl px-6 text-sm h-11">
              Demo Workspace
            </Button>
          </Link>
        </div>

        {/* Feature Teaser Cards Grid */}
        <div className="pt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Bot,
              title: 'AI Business Coach',
              desc: 'Expert ChatGPT-style consultant workspace trained on pricing metrics, margin structures, and sales scripts.',
              color: 'text-violet-400',
            },
            {
              icon: FileText,
              title: 'GST-Compliant Invoices',
              desc: 'Calculates CGST/SGST/IGST automatically. Sequential numbering, PDF downloads, and WhatsApp notification hooks.',
              color: 'text-cyan-400',
            },
            {
              icon: MessageSquare,
              title: 'WATI WhatsApp CRM',
              desc: 'Register campaign templates, connect official tokens, and schedule automated customer billing notifications.',
              color: 'text-emerald-400',
            },
          ].map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-left backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/5 blur-xl group-hover:bg-cyan-500/5 transition-colors" />
                <Icon className={`mb-4 h-7 w-7 ${f.color}`} />
                <h3 className="text-base font-bold text-white tracking-tight">{f.title}</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Premium Subscription pricing tables */}
        <section className="pt-24 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Simple Tier Pricing</h2>
            <p className="text-xs text-zinc-500">Choose the perfect plan to scale your operating margins</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 text-left flex flex-col justify-between relative overflow-hidden backdrop-blur-md ${plan.color}`}
              >
                {plan.popular && (
                  <span className="absolute top-2 right-2 rounded-full bg-violet-500 px-2.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{plan.desc}</p>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-[10px] text-zinc-500">{plan.duration}</span>
                  </div>

                  <ul className="space-y-2 pt-2 text-[10px] text-zinc-400">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-1.5 leading-relaxed">
                        <Check className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link href="/signup" className="w-full">
                    <Button
                      className={`w-full text-xs font-bold rounded-xl h-9 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90'
                          : 'bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="pt-24 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Loved by India's Top Operators</h2>
            <p className="text-xs text-zinc-500 font-mono">Real audits from Indian freelancers, agencies, and developers</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                text: 'Calculating CGST and SGST takes seconds, and having automated invoice reminders via WhatsApp has slashed my late payments to zero!',
                name: 'Karan Sharma',
                role: 'Founder, Karan Gaming Store',
              },
              {
                text: 'The AI Lead Scoring is absolutely lethal. Being able to auto-classify opportunities into Hot/Warm and generate a reachout WhatsApp draft has doubled our call conversion rate.',
                name: 'Neha Roy',
                role: 'Growth Director, Delta Media Solutions',
              },
              {
                text: 'Running my study scheduling plans, budgeting roll totals, and applying the student verification discount was extremely straightforward.',
                name: 'Aditya Patel',
                role: 'Tech Student & SaaS Indie Maker',
              },
            ].map((t, idx) => (
              <div key={idx} className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-left text-xs leading-relaxed space-y-4">
                <p className="text-zinc-300 italic">"{t.text}"</p>
                <div>
                  <h6 className="font-bold text-white">{t.name}</h6>
                  <p className="text-[10px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accordion FAQs */}
        <section className="pt-24 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-500">Got questions? We have answer scripts ready.</p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-zinc-950/40 overflow-hidden text-left"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 focus:outline-none"
                  >
                    <span className="text-xs font-bold text-white">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/5">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-[10px] text-zinc-600 bg-zinc-950/60">
        © 2026 VYRON AI. Run premium operations securely. Compliant with GDPR & DPDP Indian framework.
      </footer>
    </div>
  );
}
