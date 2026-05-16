'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  Users,
  Sparkles,
  BarChart3,
  Megaphone,
  FolderOpen,
  CreditCard,
  Settings,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/ai', label: 'AI Copilot', icon: Sparkles },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'w-64 flex-col border-r border-white/10 bg-zinc-950/80 backdrop-blur-xl p-4',
        className
      )}
    >
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-xl font-bold text-transparent">
          VYRON AI
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/settings/notifications"
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/5"
      >
        <Bell className="h-4 w-4" />
        Notifications
      </Link>
    </aside>
  );
}
