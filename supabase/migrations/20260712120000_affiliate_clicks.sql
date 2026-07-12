CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  surface TEXT NOT NULL,
  vendor TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.affiliate_clicks TO authenticated, anon;
GRANT ALL ON public.affiliate_clicks TO service_role;

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Write-only from the client: anyone (signed in or not) can log a click on an
-- affiliate card, but nobody can read other users' click rows back out.
CREATE POLICY "anyone can log affiliate clicks"
ON public.affiliate_clicks
FOR INSERT
TO authenticated, anon
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE INDEX affiliate_clicks_created_idx ON public.affiliate_clicks (created_at DESC);
CREATE INDEX affiliate_clicks_vendor_idx ON public.affiliate_clicks (vendor);
