ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS birth_date date;

CREATE TABLE IF NOT EXISTS public.growth_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  measured_at date NOT NULL,
  weight_kg numeric,
  height_cm numeric,
  head_circumference_cm numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_measurements TO authenticated;
GRANT ALL ON public.growth_measurements TO service_role;
ALTER TABLE public.growth_measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own growth measurements" ON public.growth_measurements;
CREATE POLICY "Users can manage their own growth measurements"
ON public.growth_measurements
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Family',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.household_members (
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.household_members TO authenticated;
GRANT ALL ON public.household_members TO service_role;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.household_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  accepted_by uuid,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.household_invites TO authenticated;
GRANT ALL ON public.household_invites TO service_role;
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their household" ON public.households;
CREATE POLICY "Members can view their household"
ON public.households
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = households.id
      AND hm.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Users can create owned households" ON public.households;
CREATE POLICY "Users can create owned households"
ON public.households
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Owners can update household" ON public.households;
CREATE POLICY "Owners can update household"
ON public.households
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Members can view household members" ON public.household_members;
CREATE POLICY "Members can view household members"
ON public.household_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.household_members my_membership
    WHERE my_membership.household_id = household_members.household_id
      AND my_membership.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Users can add themselves as household owner" ON public.household_members;
CREATE POLICY "Users can add themselves as household owner"
ON public.household_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'owner');
DROP POLICY IF EXISTS "Users can leave their household" ON public.household_members;
CREATE POLICY "Users can leave their household"
ON public.household_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners can manage household invites" ON public.household_invites;
CREATE POLICY "Owners can manage household invites"
ON public.household_invites
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = household_invites.household_id
      AND hm.user_id = auth.uid()
      AND hm.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = household_invites.household_id
      AND hm.user_id = auth.uid()
      AND hm.role = 'owner'
  )
);

CREATE OR REPLACE FUNCTION public.redeem_household_invite(invite_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_row public.household_invites%ROWTYPE;
BEGIN
  SELECT * INTO invite_row
  FROM public.household_invites
  WHERE code = upper(invite_code)
    AND accepted_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite code is invalid or expired';
  END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (invite_row.household_id, auth.uid(), 'member')
  ON CONFLICT (household_id, user_id) DO NOTHING;

  UPDATE public.household_invites
  SET accepted_by = auth.uid(), accepted_at = now()
  WHERE id = invite_row.id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.redeem_household_invite(text) TO authenticated;

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  surface text NOT NULL,
  vendor text NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.affiliate_clicks TO anon, authenticated;
GRANT ALL ON public.affiliate_clicks TO service_role;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can record affiliate clicks" ON public.affiliate_clicks;
CREATE POLICY "Anyone can record affiliate clicks"
ON public.affiliate_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP TRIGGER IF EXISTS touch_households_updated_at ON public.households;
CREATE TRIGGER touch_households_updated_at
BEFORE UPDATE ON public.households
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();