'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  Users,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Money' },
  { href: '/ai', icon: Sparkles, label: 'AI' },
  { href: '/leads', icon: Users, label: 'CRM' },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
];

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl',
        className
      )}
    >
      <div className="flex justify-around px-2 py-2">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px]',
                active ? 'text-cyan-400' : 'text-zinc-500'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
