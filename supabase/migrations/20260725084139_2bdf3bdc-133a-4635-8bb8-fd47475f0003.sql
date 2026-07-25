CREATE OR REPLACE FUNCTION public.debug_auth_uid()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $$ SELECT auth.uid() $$;

GRANT EXECUTE ON FUNCTION public.debug_auth_uid() TO authenticated;