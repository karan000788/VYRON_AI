-- RLS policies for VYRON AI

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_own ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY businesses_select ON public.businesses FOR SELECT
  USING (id IN (SELECT public.user_business_ids()) AND deleted_at IS NULL);
CREATE POLICY businesses_insert ON public.businesses FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY businesses_update ON public.businesses FOR UPDATE
  USING (public.user_has_role(id, ARRAY['owner','admin']::membership_role[]));

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY memberships_select ON public.memberships FOR SELECT
  USING (business_id IN (SELECT public.user_business_ids()) OR user_id = auth.uid());
CREATE POLICY memberships_insert ON public.memberships FOR INSERT
  WITH CHECK (public.user_has_role(business_id, ARRAY['owner','admin']::membership_role[]) OR created_by = auth.uid());
CREATE POLICY memberships_update ON public.memberships FOR UPDATE
  USING (public.user_has_role(business_id, ARRAY['owner','admin']::membership_role[]));

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT
  USING (business_id IN (SELECT public.user_business_ids()));
CREATE POLICY subscriptions_insert ON public.subscriptions FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY subscriptions_update ON public.subscriptions FOR UPDATE
  USING (business_id IN (SELECT public.user_business_ids()));

-- Tenant tables macro pattern
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'transactions','invoices','leads','customers','reports','campaigns',
    'documents','ai_memories','notifications','activity_logs','ai_usage_logs',
    'reminders','loyalty_rewards','feature_flags','integrations','whatsapp_opt_ins'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('
      CREATE POLICY %I_select ON public.%I FOR SELECT
      USING (business_id IN (SELECT public.user_business_ids()))', t, t);

    EXECUTE format('
      CREATE POLICY %I_insert ON public.%I FOR INSERT
      WITH CHECK (
        business_id IN (SELECT public.user_business_ids())
        AND created_by = auth.uid()
      )', t, t);

    EXECUTE format('
      CREATE POLICY %I_update ON public.%I FOR UPDATE
      USING (business_id IN (SELECT public.user_business_ids()))
      WITH CHECK (business_id IN (SELECT public.user_business_ids()))', t, t);

    EXECUTE format('
      CREATE POLICY %I_delete ON public.%I FOR DELETE
      USING (public.user_has_role(business_id, ARRAY[''owner'',''admin'']::membership_role[]))', t, t);
  END LOOP;
END $$;

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_records_select ON public.consent_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY consent_records_insert ON public.consent_records FOR INSERT WITH CHECK (user_id = auth.uid());
