CREATE TABLE public.quick_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('symptom','water','meal','sleep')),
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quick_logs TO authenticated;
GRANT ALL ON public.quick_logs TO service_role;

ALTER TABLE public.quick_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own quick_logs"
ON public.quick_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX quick_logs_user_created_idx ON public.quick_logs (user_id, created_at DESC);