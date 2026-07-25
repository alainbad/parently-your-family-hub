
ALTER TABLE public.households ALTER COLUMN name SET DEFAULT 'My family';
UPDATE public.households SET name = 'My family' WHERE name IS NULL;
ALTER TABLE public.households ALTER COLUMN name SET NOT NULL;

DROP POLICY IF EXISTS "Users can create owned households" ON public.households;
DROP POLICY IF EXISTS "Members can view their household" ON public.households;
DROP POLICY IF EXISTS "Owners can update household" ON public.households;
