-- Family sharing: a household is a small group (typically two parents) that
-- can see each other's quick_logs / reminders / growth_measurements for the
-- same baby. Writes stay individually attributed — sharing only widens who
-- can SELECT a row, never who can INSERT/UPDATE/DELETE someone else's.

CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Our family',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.household_members (
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, user_id)
);

CREATE TABLE public.household_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

GRANT SELECT, INSERT, UPDATE ON public.households TO authenticated;
GRANT SELECT, INSERT ON public.household_members TO authenticated;
GRANT SELECT, INSERT ON public.household_invites TO authenticated;
GRANT ALL ON public.households, public.household_members, public.household_invites TO service_role;

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

-- Membership-check helpers, SECURITY DEFINER so they don't recurse back
-- through the RLS policies of the tables they inspect.
CREATE OR REPLACE FUNCTION public.is_household_member(target_household_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = target_household_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_household_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm1
    JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() AND hm2.user_id = target_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_household_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_household_with(uuid) TO authenticated;

-- households
CREATE POLICY "members view their household"
ON public.households FOR SELECT TO authenticated
USING (public.is_household_member(id));

CREATE POLICY "creator becomes owner"
ON public.households FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owner updates household"
ON public.households FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- household_members
CREATE POLICY "members view their household roster"
ON public.household_members FOR SELECT TO authenticated
USING (public.is_household_member(household_id));

-- Direct client inserts only cover "become owner of the household I just
-- created." Joining via an invite code goes through redeem_household_invite()
-- below, which is SECURITY DEFINER and does not need a client-facing policy.
CREATE POLICY "become owner of a household you created"
ON public.household_members FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'owner'
  AND EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid())
);

-- household_invites: intentionally no "any live invite" SELECT policy — that
-- would let any signed-in user list every pending invite code in the system.
-- Only a household's own members can see its invites (to display the code);
-- redeeming a code you were given out-of-band goes through the SQL function.
CREATE POLICY "household members view their own invites"
ON public.household_invites FOR SELECT TO authenticated
USING (public.is_household_member(household_id));

CREATE POLICY "owners create invites"
ON public.household_invites FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.household_members hm
    WHERE hm.household_id = household_invites.household_id
      AND hm.user_id = auth.uid()
      AND hm.role = 'owner'
  )
);

-- Atomically validates + redeems an invite code and joins the caller to the
-- household. SECURITY DEFINER so it can look up the invite by code without a
-- general-purpose SELECT policy existing on household_invites.
CREATE OR REPLACE FUNCTION public.redeem_household_invite(invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.household_invites%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.household_members WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You are already in a family group';
  END IF;

  SELECT * INTO v_invite
  FROM public.household_invites
  WHERE code = upper(invite_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite code not found';
  END IF;
  IF v_invite.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'This invite has already been used';
  END IF;
  IF v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'This invite has expired';
  END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (v_invite.household_id, auth.uid(), 'member');

  UPDATE public.household_invites
  SET accepted_at = now(), accepted_by = auth.uid()
  WHERE id = v_invite.id;

  RETURN v_invite.household_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_household_invite(text) TO authenticated;

-- Additive sharing policies on existing care-tracking tables: a household
-- member can now also SELECT rows their household-mates own, on top of the
-- pre-existing owner-only policy (Postgres OR's permissive policies
-- together, so solo users — nobody else in their household — are completely
-- unaffected). Writes are untouched: everyone still only inserts/updates/
-- deletes their own rows.
CREATE POLICY "household members view shared quick_logs"
ON public.quick_logs FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

CREATE POLICY "household members view shared reminders"
ON public.reminders FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

CREATE POLICY "household members view shared growth_measurements"
ON public.growth_measurements FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

CREATE INDEX household_members_user_idx ON public.household_members (user_id);
CREATE INDEX household_invites_household_idx ON public.household_invites (household_id);
