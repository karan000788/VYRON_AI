'use client';

import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('VYRON Service Worker registered successfully: ', reg.scope),
          (err) => console.error('VYRON Service Worker registration failed: ', err)
        );
      });
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          dedupingInterval: 5000,
        }}
      >
        {children}
        <Toaster position="top-right" richColors />
      </SWRConfig>
    </ThemeProvider>
  );
}
