'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
  const [password, setPassword] = useState('');
  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

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
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" name="businessName" required autoComplete="organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex rounded-md border border-input bg-background">
                <span className="flex items-center border-r border-white/10 px-3 text-sm text-zinc-400">+91</span>
                <Input
                  id="phone"
                  name="phone"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  className="border-0"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GST Number <span className="text-zinc-500">(optional)</span></Label>
              <Input
                id="gstin"
                name="gstin"
                maxLength={15}
                minLength={15}
                pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]"
                placeholder="27AAAAA1111A1Z1"
              />
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all"
                  style={{ width: `${Math.max(1, passwordScore) * 25}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                Strength: {['Too weak', 'Basic', 'Good', 'Strong'][Math.max(0, passwordScore - 1)] ?? 'Too weak'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
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
