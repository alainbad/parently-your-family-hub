
-- baby_logs table used by the Track tab
CREATE TABLE public.baby_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.baby_logs TO authenticated;
GRANT ALL ON public.baby_logs TO service_role;

ALTER TABLE public.baby_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own baby_logs" ON public.baby_logs
FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "household members view shared baby_logs"
ON public.baby_logs FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

CREATE INDEX baby_logs_user_created_idx ON public.baby_logs (user_id, created_at DESC);

-- Tighten SECURITY DEFINER helper grants: only used from within RLS policies,
-- not from client-callable API. Postgres can still invoke them for policy checks.
REVOKE EXECUTE ON FUNCTION public.is_household_member(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.shares_household_with(uuid) FROM PUBLIC, anon, authenticated;

-- redeem_household_invite must remain callable by signed-in users
REVOKE EXECUTE ON FUNCTION public.redeem_household_invite(text) FROM PUBLIC, anon;
