import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HouseholdMember = {
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
};

export type HouseholdInfo = {
  household: { id: string; name: string } | null;
  role: "owner" | "member" | null;
  members: HouseholdMember[];
  pendingInviteCode: string | null;
};

function generateInviteCode(): string {
  // No 0/O/1/I — avoids codes that are ambiguous to read or type back in.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const getMyHousehold = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HouseholdInfo> => {
    const { data: membership, error: membershipErr } = await context.supabase
      .from("household_members")
      .select("household_id, role")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (membershipErr) throw new Error(membershipErr.message);
    if (!membership) return { household: null, role: null, members: [], pendingInviteCode: null };

    const [{ data: household }, { data: members }] = await Promise.all([
      context.supabase
        .from("households")
        .select("id, name")
        .eq("id", membership.household_id)
        .single(),
      context.supabase
        .from("household_members")
        .select("user_id, role, joined_at")
        .eq("household_id", membership.household_id),
    ]);

    let pendingInviteCode: string | null = null;
    if (membership.role === "owner") {
      const { data: invite } = await context.supabase
        .from("household_invites")
        .select("code")
        .eq("household_id", membership.household_id)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      pendingInviteCode = invite?.code ?? null;
    }

    return {
      household: household ?? null,
      role: membership.role as "owner" | "member",
      members: (members ?? []) as HouseholdMember[],
      pendingInviteCode,
    };
  });

export const createHouseholdInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ code: string }> => {
    const { data: existingMembership, error: membershipErr } = await context.supabase
      .from("household_members")
      .select("household_id, role")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (membershipErr) throw new Error(membershipErr.message);

    let householdId: string;
    if (existingMembership) {
      if (existingMembership.role !== "owner") {
        throw new Error("Only the family group owner can invite.");
      }
      householdId = existingMembership.household_id;
    } else {
      const { data: household, error: createErr } = await context.supabase
        .from("households")
        .insert({ owner_id: context.userId })
        .select("id")
        .single();
      if (createErr || !household) {
        throw new Error(createErr?.message ?? "Could not create family group");
      }
      const { error: memberErr } = await context.supabase
        .from("household_members")
        .insert({ household_id: household.id, user_id: context.userId, role: "owner" });
      if (memberErr) throw new Error(memberErr.message);
      householdId = household.id;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateInviteCode();
      const { error } = await context.supabase.from("household_invites").insert({
        household_id: householdId,
        code,
        created_by: context.userId,
      });
      if (!error) return { code };
      if (!error.message.toLowerCase().includes("duplicate")) throw new Error(error.message);
    }
    throw new Error("Could not generate an invite code — try again.");
  });

export const acceptHouseholdInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().min(4) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("redeem_household_invite", {
      invite_code: data.code,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const leaveHousehold = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("household_members")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const householdQuery = () =>
  queryOptions({
    queryKey: ["household"],
    queryFn: () => getMyHousehold(),
  });
