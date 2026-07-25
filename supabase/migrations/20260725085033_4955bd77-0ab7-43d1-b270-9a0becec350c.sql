CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'auth_uid', auth.uid(),
    'auth_role_claim', auth.role(),
    'current_user', current_user,
    'session_user', session_user,
    'is_member_of_authenticated', pg_has_role(current_user, 'authenticated', 'MEMBER')
  )
$$;

GRANT EXECUTE ON FUNCTION public.debug_auth_context() TO authenticated;