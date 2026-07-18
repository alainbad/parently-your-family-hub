DROP POLICY IF EXISTS "Anyone can record affiliate clicks" ON public.affiliate_clicks;
CREATE POLICY "Anyone can record complete affiliate clicks"
ON public.affiliate_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(surface)) > 0
  AND length(trim(vendor)) > 0
  AND length(trim(title)) > 0
  AND url ~* '^https?://'
);

DROP FUNCTION IF EXISTS public.redeem_household_invite(text);