'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-zinc-300 shadow-xl backdrop-blur hover:text-white"
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <Link
        href="/signup"
        className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-cyan-500/15"
      >
        Start Free Trial →
      </Link>
    </div>
  );
}
