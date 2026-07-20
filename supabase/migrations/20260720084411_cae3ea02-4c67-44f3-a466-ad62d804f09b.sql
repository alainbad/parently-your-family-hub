
-- Helper functions (SECURITY DEFINER to bypass RLS on the tables they check)
CREATE OR REPLACE FUNCTION public.is_household_member(target_household_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = target_household_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_household_with(target_user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm1
    JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() AND hm2.user_id = target_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_household_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_household_with(uuid) TO authenticated;

-- Households policies (drop-if-exists to stay idempotent with prior migrations)
DROP POLICY IF EXISTS "members view their household" ON public.households;
CREATE POLICY "members view their household"
ON public.households FOR SELECT TO authenticated
USING (public.is_household_member(id));

DROP POLICY IF EXISTS "creator becomes owner" ON public.households;
CREATE POLICY "creator becomes owner"
ON public.households FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner updates household" ON public.households;
CREATE POLICY "owner updates household"
ON public.households FOR UPDATE TO authenticated
USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Household members policies
DROP POLICY IF EXISTS "members view their household roster" ON public.household_members;
CREATE POLICY "members view their household roster"
ON public.household_members FOR SELECT TO authenticated
USING (public.is_household_member(household_id));

DROP POLICY IF EXISTS "become owner of a household you created" ON public.household_members;
CREATE POLICY "become owner of a household you created"
ON public.household_members FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'owner'
  AND EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid())
);

-- Household invites policies
DROP POLICY IF EXISTS "household members view their own invites" ON public.household_invites;
CREATE POLICY "household members view their own invites"
ON public.household_invites FOR SELECT TO authenticated
USING (public.is_household_member(household_id));

DROP POLICY IF EXISTS "owners create invites" ON public.household_invites;
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

-- Redeem invite (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.redeem_household_invite(invite_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invite public.household_invites%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.household_members WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'You are already in a family group';
  END IF;
  SELECT * INTO v_invite FROM public.household_invites
  WHERE code = upper(invite_code) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invite code not found'; END IF;
  IF v_invite.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'This invite has already been used'; END IF;
  IF v_invite.expires_at < now() THEN RAISE EXCEPTION 'This invite has expired'; END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (v_invite.household_id, auth.uid(), 'member');

  UPDATE public.household_invites
  SET accepted_at = now(), accepted_by = auth.uid()
  WHERE id = v_invite.id;

  RETURN v_invite.household_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_household_invite(text) TO authenticated;

-- Additive shared-read policies for care-tracking tables
DROP POLICY IF EXISTS "household members view shared quick_logs" ON public.quick_logs;
CREATE POLICY "household members view shared quick_logs"
ON public.quick_logs FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

DROP POLICY IF EXISTS "household members view shared reminders" ON public.reminders;
CREATE POLICY "household members view shared reminders"
ON public.reminders FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

DROP POLICY IF EXISTS "household members view shared growth_measurements" ON public.growth_measurements;
CREATE POLICY "household members view shared growth_measurements"
ON public.growth_measurements FOR SELECT TO authenticated
USING (public.shares_household_with(user_id));

CREATE INDEX IF NOT EXISTS household_members_user_idx ON public.household_members (user_id);
CREATE INDEX IF NOT EXISTS household_invites_household_idx ON public.household_invites (household_id);
