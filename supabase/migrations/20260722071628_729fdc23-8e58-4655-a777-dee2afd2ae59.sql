DROP POLICY IF EXISTS "Anyone can record complete affiliate clicks" ON public.affiliate_clicks;
CREATE POLICY "Anyone can record complete affiliate clicks"
ON public.affiliate_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (length(TRIM(BOTH FROM surface)) > 0)
  AND (length(TRIM(BOTH FROM vendor)) > 0)
  AND (length(TRIM(BOTH FROM title)) > 0)
  AND (url ~* '^https?://')
  AND (user_id IS NULL OR user_id = auth.uid())
);