import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Tables with a direct user_id column and no cascading delete from auth.users —
// each one has to be cleared explicitly before the auth account itself is removed.
const USER_OWNED_TABLES = [
  "quick_logs",
  "baby_logs",
  "growth_measurements",
  "milestone_records",
  "reminders",
  "affiliate_clicks",
  "chat_messages",
  "chat_threads",
] as const;

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    for (const table of USER_OWNED_TABLES) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (error) {
        throw new Error(`Could not delete your ${table.replace(/_/g, " ")}: ${error.message}`);
      }
    }

    const { data: membership } = await supabaseAdmin
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (membership) {
      const { error: leaveError } = await supabaseAdmin
        .from("household_members")
        .delete()
        .eq("user_id", userId);
      if (leaveError) {
        throw new Error(`Could not remove your family group membership: ${leaveError.message}`);
      }

      // Only the last member leaving actually removes the shared household —
      // otherwise the rest of the family keeps their logs and reminders intact.
      const { count } = await supabaseAdmin
        .from("household_members")
        .select("user_id", { count: "exact", head: true })
        .eq("household_id", membership.household_id);
      if (!count) {
        const { error: deleteHouseholdError } = await supabaseAdmin
          .from("households")
          .delete()
          .eq("id", membership.household_id);
        if (deleteHouseholdError) {
          throw new Error(`Could not remove your family group: ${deleteHouseholdError.message}`);
        }
      }
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profileError) throw new Error(`Could not delete your profile: ${profileError.message}`);

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message || "Could not delete your account");

    return { ok: true };
  });
