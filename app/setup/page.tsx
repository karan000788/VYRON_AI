import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Connect Supabase</CardTitle>
          <CardDescription>
            VYRON AI needs your Supabase project URL and anon key before auth and data features work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-400">
          <ol className="list-decimal space-y-2 pl-4">
            <li>
              Open{' '}
              <a
                href="https://supabase.com/dashboard"
                className="text-cyan-400 underline"
                target="_blank"
                rel="noreferrer"
              >
                Supabase Dashboard
              </a>{' '}
              → your project → <strong>Settings → API</strong>
            </li>
            <li>
              Copy <strong>Project URL</strong> and <strong>anon public</strong> key into{' '}
              <code className="text-zinc-200">.env.local</code> in the project root
            </li>
            <li>
              Run migrations: <code className="text-zinc-200">supabase db push</code> (or paste SQL
              from <code className="text-zinc-200">supabase/migrations/</code>)
            </li>
            <li>Restart the dev server: <code className="text-zinc-200">npm run dev</code></li>
          </ol>
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-zinc-300">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...`}
          </pre>
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
