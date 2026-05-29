'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const links = [
  ['Features', '/#features'],
  ['Demo', '/demo'],
  ['Contact', '/contact'],
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
  ['Refund', '/refund'],
];

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-white/5 bg-zinc-950/70 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-xl font-extrabold text-transparent tracking-tight">
          VYRON AI
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-[11px] font-medium text-zinc-500 hover:text-white">
              {label}
            </Link>
          ))}
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white text-xs">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-black hover:bg-zinc-200 text-xs font-bold px-4 h-8.5 rounded-xl">
              Start Free Trial
            </Button>
          </Link>
        </nav>
        <button className="md:hidden text-zinc-300" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="mx-auto mt-4 grid max-w-6xl gap-2 rounded-xl border border-white/10 bg-zinc-950 p-3 md:hidden">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
              {label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">Sign in</Link>
          <Link href="/signup" onClick={() => setOpen(false)} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-black">Start Free Trial</Link>
        </div>
      )}
    </header>
  );
}
