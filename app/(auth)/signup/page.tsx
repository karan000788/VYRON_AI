'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signUpAction, type AuthResult } from '@/lib/actions/auth';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { SupabaseSetupRequired } from '@/components/supabase-setup-required';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating…' : 'Create account'}
    </Button>
  );
}

function SignupForm() {
  const [state, formAction] = useFormState<AuthResult | null, FormData>(signUpAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="relative w-full max-w-md">
        <CardHeader>
          <CardTitle>Start your 7-day trial</CardTitle>
          <CardDescription>Full access on Starter plan</CardDescription>
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
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="fullName" required autoComplete="name" />
            </div>
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
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-zinc-400">
              <input type="checkbox" name="consent" className="mt-1" />
              I consent to data processing per India DPDP Act and{' '}
              <Link href="/privacy" className="text-cyan-400 underline">
                Privacy Policy
              </Link>
              .
            </label>
            <SubmitButton />
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupRequired />;
  }
  return <SignupForm />;
}
