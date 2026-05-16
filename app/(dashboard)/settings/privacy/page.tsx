'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(false);

  async function requestExport() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Not signed in');
      setLoading(false);
      return;
    }
    await supabase.from('notifications').insert({
      business_id: (await supabase.from('memberships').select('business_id').eq('user_id', user.id).limit(1).single()).data?.business_id,
      user_id: user.id,
      title: 'Data export requested',
      body: 'We will email your export within 48 hours.',
      created_by: user.id,
    });
    toast.success('Export requested');
    setLoading(false);
  }

  async function requestDelete() {
    if (!confirm('Request account deletion? PII anonymized within 30 days.')) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('users')
      .update({ delete_requested_at: new Date().toISOString() })
      .eq('id', user.id);
    toast.success('Deletion request recorded');
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Privacy settings</h1>
      <p className="text-zinc-400">DPDP-compliant data controls</p>
      <Button variant="secondary" onClick={requestExport} disabled={loading}>
        Export my data
      </Button>
      <Button variant="destructive" onClick={requestDelete} disabled={loading}>
        Request account deletion
      </Button>
    </div>
  );
}
