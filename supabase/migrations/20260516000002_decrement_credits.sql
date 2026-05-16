CREATE OR REPLACE FUNCTION public.decrement_ai_credits(
  p_business_id UUID,
  p_amount INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions
  SET ai_credits_remaining = GREATEST(0, ai_credits_remaining - p_amount)
  WHERE business_id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
