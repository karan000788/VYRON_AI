'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 transition-all shadow-md">
        <div className="h-4 w-4" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white transition-all shadow-md"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-400" />}
    </button>
  );
}
