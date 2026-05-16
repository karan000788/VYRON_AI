import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SupabaseSetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="pointer-events-none fixed inset-0 bg-vyron-gradient" />
      <Card className="relative w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect Supabase first</CardTitle>
          <CardDescription>
            Sign up and the 7-day trial need a Supabase project. Add your keys to{' '}
            <code className="text-zinc-200">.env.local</code>, then restart{' '}
            <code className="text-zinc-200">npm run dev</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-400">
            Get <strong>Project URL</strong> and <strong>anon key</strong> from Supabase →
            Settings → API.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/setup">
              <Button className="w-full">Setup instructions</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="w-full">
                Back home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
