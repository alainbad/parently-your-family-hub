import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { openAppleToken, revokeAppleToken, sealAppleToken } from "./apple-tokens.server";

type TokenRow = { user_id: string; client_id: string; encrypted_token: string; updated_at: string };
type TokenDatabase = {
  public: {
    Tables: {
      apple_provider_tokens: {
        Row: TokenRow;
        Insert: Omit<TokenRow, "updated_at"> & { updated_at?: string };
        Update: Partial<TokenRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
const admin = supabaseAdmin as unknown as SupabaseClient<TokenDatabase>;
export async function storeAppleToken(userId: string, clientId: string, refreshToken: string) {
  const encrypted = await sealAppleToken(refreshToken, userId, clientId);
  const { error } = await admin.from("apple_provider_tokens").upsert(
    {
      user_id: userId,
      client_id: clientId,
      encrypted_token: encrypted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,client_id" },
  );
  if (error) throw new Error("Apple authorization could not be saved. Please sign in again.");
}
export async function revokeStoredAppleTokens(userId: string): Promise<boolean> {
  const { data, error } = await admin
    .from("apple_provider_tokens")
    .select("*")
    .eq("user_id", userId);
  // Allow the old deployment to delete accounts before the migration is applied.
  if (
    error &&
    process.env.APPLE_DIRECT_AUTH_ENABLED !== "true" &&
    ["42P01", "PGRST205"].includes(error.code)
  )
    return false;
  if (error) throw new Error("Apple authorization could not be loaded. Please retry deletion.");
  if (!data?.length) return false;
  for (const row of data) {
    const token = await openAppleToken(row.encrypted_token, userId, row.client_id);
    await revokeAppleToken(token, row.client_id);
  }
  // Retain encrypted records until Auth user deletion cascades them. If later
  // cleanup fails, retries can revoke again; Apple's revoke operation is idempotent.
  return true;
}
