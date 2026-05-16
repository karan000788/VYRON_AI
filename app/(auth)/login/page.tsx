import { Suspense } from 'react';
import LoginForm from './login-form';
import { Skeleton } from '@/components/ui/skeleton';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { SupabaseSetupRequired } from '@/components/supabase-setup-required';

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return <SupabaseSetupRequired />;
  }

  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-32 h-64 w-full max-w-md" />}>
      <LoginForm />
    </Suspense>
  );
}
