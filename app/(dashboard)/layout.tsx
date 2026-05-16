import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { createClient } from '@/lib/supabase/server';
import type { Workspace } from '@/stores/workspace-store';
import type { MembershipRole } from '@/types/database';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: memberships } = await supabase
    .from('memberships')
    .select(
      `
      role,
      business:businesses (
        id, name, slug, logo_url
      )
    `
    )
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null);

  const workspaces: Workspace[] =
    memberships?.flatMap((m) => {
      const raw = m.business;
      const b = (Array.isArray(raw) ? raw[0] : raw) as {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
      } | null;
      if (!b?.id) return [];
      return [
        {
          id: b.id,
          name: b.name,
          slug: b.slug,
          role: m.role as MembershipRole,
          logoUrl: b.logo_url,
        },
      ];
    }) ?? [];

  return (
    <DashboardShell user={user} initialWorkspaces={workspaces}>
      {children}
    </DashboardShell>
  );
}
