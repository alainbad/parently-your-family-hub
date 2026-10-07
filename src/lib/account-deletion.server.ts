import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Every mutation is scoped to the authenticated account. Cleanup is repeatable:
// if a provider fails, retain the login so the user can retry; never report success.
export async function eraseAccount(admin: SupabaseClient<Database>, userId: string, token: string) {
  const checked = async (operation: PromiseLike<{ error: unknown }>) => {
    const { error } = await operation;
    if (error) throw error;
  };
  const bucket = admin.storage.from("baby-photos");
  async function removeFolder(prefix: string) {
    // Collect before deleting so offset pagination never skips objects.
    const files: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(prefix, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      for (const item of data ?? []) {
        const path = `${prefix}/${item.name}`;
        if (item.id) files.push(path);
        else await removeFolder(path);
      }
      if (!data || data.length < 100) break;
    }
    for (let i = 0; i < files.length; i += 100)
      await checked(bucket.remove(files.slice(i, i + 100)));
  }
  await removeFolder(userId);
  // Explicit cleanup also covers installations with older, non-cascading schemas.
  for (const table of [
    "chat_messages",
    "chat_threads",
    "quick_logs",
    "baby_logs",
    "growth_measurements",
    "reminders",
    "milestone_records",
    "affiliate_clicks",
  ] as const) {
    await checked(admin.from(table).delete().eq("user_id", userId));
  }
  await checked(admin.from("household_invites").delete().eq("created_by", userId));
  await checked(
    admin.from("household_invites").update({ accepted_by: null }).eq("accepted_by", userId),
  );
  // Dissolve owned groups; members' accounts and their own records are preserved.
  await checked(admin.from("households").delete().eq("owner_id", userId));
  await checked(admin.from("household_members").delete().eq("user_id", userId));
  await checked(admin.from("profiles").delete().eq("id", userId));
  await checked(admin.auth.admin.signOut(token, "global"));
  await checked(admin.auth.admin.deleteUser(userId, false));
}
