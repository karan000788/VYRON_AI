import Link from 'next/link';

export function PublicFooter() {
  const columns = [
    { title: 'Product', links: [['Features', '/#features'], ['Demo', '/demo'], ['Changelog', '/#changelog']] },
    { title: 'Company', links: [['About', '/#about'], ['Contact', '/contact'], ['Blog', '/#blog'], ['Careers', '/#careers']] },
    { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund Policy', '/refund'], ['DPDP Compliance', '/privacy#dpdp']] },
  ];

  return (
    <footer className="relative z-10 border-t border-white/5 bg-zinc-950/80 px-6 py-10 text-sm text-zinc-400">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-xl font-extrabold text-transparent">
            VYRON AI
          </Link>
          <p className="text-xs leading-relaxed text-zinc-500">
            AI CRM, GST invoicing, analytics, and automation for Indian businesses.
          </p>
          <p className="text-[11px] text-zinc-600">© 2026 VYRON AI. GSTIN: [YOUR_GSTIN]</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-300">{column.title}</h3>
            <div className="space-y-2">
              {column.links.map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs text-zinc-500 hover:text-cyan-400">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/5 pt-5 text-center text-xs text-zinc-600">
        Made in India 🇮🇳 · DPDP & GDPR Compliant
      </div>
    </footer>
  );
}
