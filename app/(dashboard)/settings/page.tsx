import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/settings/privacy">
          <Card className="transition hover:bg-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-base text-white">Privacy & DPDP</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Export data, delete account, consent records, and DPDP Indian compliance settings.
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/team">
          <Card className="transition hover:bg-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-base text-white">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Manage invites, team roles, and plan-based member capacity checks.
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/whatsapp">
          <Card className="transition hover:bg-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-base text-white">WhatsApp Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Configure WATI endpoints, template registrations, and invoice automated notifications.
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/student">
          <Card className="transition hover:bg-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-base text-white">Student Hub & Discounts</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400">
              Apply student discounts, track personal budgets, and manage your custom study planners.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
