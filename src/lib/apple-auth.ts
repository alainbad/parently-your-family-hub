import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const retainAppleAuthorization = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        accessToken: z.string().min(1).max(16384),
        code: z.string().min(1).max(4096),
        idToken: z.string().min(1).max(16384),
        nonce: z.string().regex(/^[a-f0-9]{64}$/),
        platform: z.enum(["ios", "web"]),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data: input }) => {
    if (process.env.APPLE_DIRECT_AUTH_ENABLED !== "true")
      throw new Error("Direct Apple sign-in is not enabled yet.");
    // The pending session is not installed in the browser until token retention
    // succeeds. Verify its bearer token directly with Auth, never decode-only.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.getUser(input.accessToken);
    if (error || !data.user) throw new Error("Please sign in again.");
    const { APPLE_CLIENTS, verifyAppleIdentity, exchangeAppleCode, revokeAppleToken } =
      await import("./apple-tokens.server");
    const { storeAppleToken } = await import("./apple-token-store.server");
    const clientId = APPLE_CLIENTS[input.platform];
    const subject = await verifyAppleIdentity(input.idToken, clientId, input.nonce);
    // Match provider identity, never email or editable user_metadata.
    if (
      !data.user.identities?.some(
        (identity) => identity.provider === "apple" && identity.id === subject,
      )
    )
      throw new Error("Apple identity does not match your signed-in account.");
    const tokens = await exchangeAppleCode(input.code, clientId);
    try {
      const exchangedSubject = await verifyAppleIdentity(tokens.idToken, clientId, input.nonce);
      if (exchangedSubject !== subject) throw new Error("Apple identity did not match.");
      await storeAppleToken(data.user.id, clientId, tokens.refreshToken);
    } catch {
      // Do not leave an authorization untracked after a storage/validation failure.
      await revokeAppleToken(tokens.refreshToken, clientId);
      throw new Error("Apple authorization could not be saved. Please sign in again.");
    }
    return { saved: true };
  });
