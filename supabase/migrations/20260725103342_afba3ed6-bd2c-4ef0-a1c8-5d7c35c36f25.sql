CREATE OR REPLACE FUNCTION public.is_new_household_owner(target_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT auth.uid() = target_owner_id $$;

GRANT EXECUTE ON FUNCTION public.is_new_household_owner(uuid) TO authenticated;

DROP POLICY IF EXISTS "creator becomes owner" ON public.households;

CREATE POLICY "creator becomes owner"
ON public.households FOR INSERT TO authenticated
WITH CHECK (public.is_new_household_owner(owner_id));

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;