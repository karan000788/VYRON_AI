import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { monthlyCreditsForPlan } from '@/lib/ai/credits';
import { trialEndsAt } from '@/lib/subscription/state-machine';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    
    // Get current user and workspace
    const { data: { user } } = await supabase.auth.getUser();
    const businessId = (await import('next/headers')).cookies().get('vyron_workspace')?.value;

    if (!user || !businessId) {
      return NextResponse.json({ error: 'Not logged in or no workspace selected' });
    }

    // Check if subscription exists
    const { data: sub } = await admin
      .from('subscriptions')
      .select('id')
      .eq('business_id', businessId)
      .maybeSingle();

    if (!sub) {
      // Create missing subscription
      const trialEnd = trialEndsAt();
      const { error } = await admin.from('subscriptions').insert({
        business_id: businessId,
        plan: 'starter',
        status: 'trialing',
        trial_ends_at: trialEnd.toISOString(),
        ai_credits_remaining: monthlyCreditsForPlan('starter'),
        ai_credits_reset_at: trialEnd.toISOString(),
        created_by: user.id,
      });
      
      if (error) {
        return NextResponse.json({ error: 'Failed to fix subscription', details: error });
      }
      return NextResponse.json({ success: true, message: 'Missing subscription created successfully! You can now use the AI.' });
    }

    return NextResponse.json({ success: true, message: 'Subscription already exists.' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
