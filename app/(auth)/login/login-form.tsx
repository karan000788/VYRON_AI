'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signInAction, signInWithGoogleAction, type AuthResult } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);

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
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-2 flex items-center text-zinc-500 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Link href="/forgot-password" className="inline-block text-xs text-cyan-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <SubmitButton />
          </form>
          <form action={signInWithGoogleAction} className="mt-3">
            <Button type="submit" variant="secondary" className="w-full border-white/10 bg-white/5 text-white">
              Continue with Google
            </Button>
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
