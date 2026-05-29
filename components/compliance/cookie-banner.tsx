'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vyron_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('vyron_cookie_consent', JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
  }

  function manage() {
    localStorage.setItem('vyron_cookie_consent', JSON.stringify({ accepted: false, preferences: true, at: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-md">
      <p className="text-sm text-zinc-300">
        We use cookies to improve your experience. By continuing, you agree to our{' '}
        <Link href="/privacy" className="text-cyan-400 underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={accept}>
          Accept All
        </Button>
        <Button size="sm" variant="ghost" onClick={manage}>
          Manage Preferences
        </Button>
      </div>
    </div>
  );
}
