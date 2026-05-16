'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from './use-workspace';
import type { Subscription } from '@/types/database';
import { getAccessDecision } from '@/lib/subscription/guard';

async function fetchSubscription(businessId: string): Promise<Subscription | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();
  return data as Subscription | null;
}

export function useSubscription() {
  const { activeId } = useWorkspace();
  const { data, error, isLoading, mutate } = useSWR(
    activeId ? ['subscription', activeId] : null,
    () => (activeId ? fetchSubscription(activeId) : null)
  );

  const access = data ? getAccessDecision(data.status) : null;

  return {
    subscription: data,
    access,
    isLoading,
    error,
    mutate,
  };
}
