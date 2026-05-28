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
import { motion } from 'framer-motion';

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
        'fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-border bg-background/80 p-2.5 backdrop-blur-xl shadow-lg',
        className
      )}
    >
      <div className="flex justify-around items-center px-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all focus:outline-none"
            >
              {active && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={cn(
                'h-4.5 w-4.5 relative z-10 transition-colors duration-200',
                active ? 'text-cyan-400' : 'text-zinc-500'
              )} />
              <span className={cn(
                'text-[9px] font-bold mt-1 tracking-wide relative z-10 transition-colors duration-200',
                active ? 'text-white' : 'text-zinc-500'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
