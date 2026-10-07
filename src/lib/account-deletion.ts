import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ confirmation: z.literal("DELETE") })
      .strict()
      .parse(input),
  )
  .handler(async ({ context }) => {
    const token = getRequest().headers.get("authorization")?.slice(7);
    if (!token) throw new Error("Please sign in again before deleting your account.");
    // Validate against Auth, not only a cached JWT claim.
    const { data, error } = await context.supabase.auth.getUser(token);
    if (error || !data.user || data.user.id !== context.userId) {
      throw new Error("Please sign in again before deleting your account.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { eraseAccount } = await import("@/lib/account-deletion.server");
    try {
      await eraseAccount(supabaseAdmin, data.user.id, token);
    } catch (error) {
      console.error(
        "Account deletion could not finish",
        error instanceof Error ? error.message : "Provider error",
      );
      throw new Error(
        "Deletion could not finish. Some data may already have been removed. Please retry; if your session expired, sign in again first.",
      );
    }
    return { deleted: true };
  });
