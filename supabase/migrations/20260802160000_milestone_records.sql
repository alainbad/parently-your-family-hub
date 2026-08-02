-- Lets parents mark a Journey milestone as achieved with their own date,
-- instead of Journey only ever showing generic age-based Done/Now/Upcoming
-- state. One row per (user, milestone) — presence of a row means achieved.

CREATE TABLE public.milestone_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  achieved_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestone_records TO authenticated;
GRANT ALL ON public.milestone_records TO service_role;

ALTER TABLE public.milestone_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own milestone records"
ON public.milestone_records
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX milestone_records_user_idx ON public.milestone_records (user_id);
