import { PublicFooter } from '@/components/layout/public-footer';
import { PublicNav } from '@/components/layout/public-nav';

const sections = [
  ['Account Usage', 'You are responsible for maintaining accurate account information, protecting credentials, and ensuring workspace users only access business data they are authorized to use.'],
  ['Subscription Billing', 'Paid features, invoices, and billing cycles are governed by the plan selected in the product. Taxes may apply under Indian law.'],
  ['Cancellation', 'You may cancel with 30-day notice. Access may continue until the end of the active billing period, subject to account standing and compliance requirements.'],
  ['Prohibited Uses', 'You may not use VYRON AI for illegal activity, fraud, spam, unauthorized scraping, credential sharing, or processing personal data without lawful basis.'],
  ['Liability Disclaimer', 'VYRON AI provides automation and analytics tools as-is. You remain responsible for accounting, tax, legal, and business decisions made using outputs from the platform.'],
  ['Governing Law', 'These terms are governed by the laws of India.'],
  ['Dispute Resolution', 'Disputes should first be raised with support@vyron.ai. If unresolved, disputes will be handled through courts or arbitration in India as applicable.'],
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-extrabold">Terms of Service</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-400">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="mb-2 text-lg font-bold text-white">{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
