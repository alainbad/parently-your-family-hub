CREATE OR REPLACE FUNCTION public.is_new_household_owner(target_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$ SELECT auth.uid() = target_owner_id $$;