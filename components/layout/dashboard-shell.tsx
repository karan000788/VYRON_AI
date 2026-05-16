'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { WorkspaceSwitcher } from './workspace-switcher';
import { useWorkspaceStore, type Workspace } from '@/stores/workspace-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface DashboardShellProps {
  user: User;
  initialWorkspaces: Workspace[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  initialWorkspaces,
  children,
}: DashboardShellProps) {
  const { setWorkspaces, setActiveWorkspace, activeWorkspaceId } = useWorkspaceStore();

  useEffect(() => {
    setWorkspaces(initialWorkspaces);
    if (initialWorkspaces[0] && !activeWorkspaceId) {
      setActiveWorkspace(initialWorkspaces[0].id);
    }
  }, [initialWorkspaces, setWorkspaces, setActiveWorkspace, activeWorkspaceId]);

  const initials =
    user.user_metadata?.full_name?.slice(0, 2)?.toUpperCase() ??
    user.email?.slice(0, 2)?.toUpperCase() ??
    'VY';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-vyron-gradient" />
      <div className="relative flex">
        <Sidebar className="hidden lg:flex" />
        <main className="min-h-screen flex-1 pb-20 lg:pb-0">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-zinc-950/70 px-4 py-3 backdrop-blur-xl">
            <WorkspaceSwitcher />
            <Link href="/settings/profile">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </header>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
      <MobileNav className="lg:hidden" />
    </div>
  );
}
