import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/settings/privacy">
          <Card className="transition hover:bg-white/10">
            <CardHeader>
              <CardTitle>Privacy & DPDP</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              Export data, delete account, consent records
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/team">
          <Card className="transition hover:bg-white/10">
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              Invites and role-based access
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
