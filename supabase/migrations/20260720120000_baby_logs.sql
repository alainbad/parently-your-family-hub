CREATE TABLE public.baby_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('feeding','sleep','diaper','pumping','medicine','temperature')),
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.baby_logs TO authenticated;
GRANT ALL ON public.baby_logs TO service_role;

ALTER TABLE public.baby_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own baby_logs"
ON public.baby_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX baby_logs_user_created_idx ON public.baby_logs (user_id, created_at DESC);
