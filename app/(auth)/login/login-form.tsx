'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signInAction, type AuthResult } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState<AuthResult | null, FormData>(signInAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="pointer-events-none fixed inset-0 bg-vyron-gradient" />
      <Card className="relative w-full max-w-md">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            VYRON AI
          </CardTitle>
          <CardDescription>Sign in to your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </p>
          )}
          {state?.message && (
            <p className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
              {state.message}
            </p>
          )}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <SubmitButton />
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            No account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:underline">
              Start free trial
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
