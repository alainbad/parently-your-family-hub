CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'current_user', current_user,
    'session_user', session_user,
    'jwt_claims', current_setting('request.jwt.claims', true)
  )
$$;

GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated;