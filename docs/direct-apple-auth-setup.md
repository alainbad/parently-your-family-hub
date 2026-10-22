# Direct Apple authorization — setup required before activation

This implementation is in draft PR #37. It has not been deployed or tested with a real Apple account or compiled in Xcode. The default remains the existing Lovable broker until the client flag is explicitly enabled.

## What the code does

- iOS: AuthenticationServices obtains an identity token and one-time authorization code with a random nonce and state. Debug and Release targets now include Sign in with Apple entitlements.
- Web: Apple's official JavaScript popup obtains the same credentials; its state is checked. The callback URL is the current origin plus `/auth-callback`.
- Supabase validates the identity token using a temporary, non-persisted client. The application does not install this session until the server retains the Apple authorization.
- The server verifies the pending Supabase session with Auth, independently validates the Apple signature, issuer, audience, expiry and hashed nonce, and matches the Apple subject to the verified provider identity (never an email or user-editable metadata).
- The server exchanges the authorization code directly with Apple, validates the returned identity, then encrypts the refresh token with A256GCM before storage. Encryption binds it to the Supabase user and Apple client. The table has RLS enabled, no user policies and no anon/authenticated grants.
- Account deletion revokes stored Apple authorizations for both clients before removing data. Provider errors stop deletion for retry. Successful Auth deletion cascades encrypted tokens. Older broker users without stored tokens retain the manual disconnect instructions.

## Configure a staging environment first

1. Apply `supabase/migrations/20261022120000_apple_provider_tokens.sql` to the intended backend. Keep the existing migration history. No production migration has been run by this change.
2. The **direct Supabase Auth Apple provider** must accept BOTH audiences:
   - `com.parentlybabytracking.app.web` (web Services ID)
   - `com.parentlybabytracking.app` (iOS Bundle ID)

   Lovable's broker configuration is not proof of this. Lovable does not document direct `signInWithIdToken` support for this project. Confirm the underlying Auth configuration with the platform before activation; if it cannot be configured, this integration cannot be activated on that backend. Do not replace the Services ID with the Bundle ID in the existing broker form.
3. Add `https://parently-babytracking.com/auth-callback` to the Apple Services ID Return URLs, preserving existing broker URLs. Register the exact staging origin's callback too. The Services ID and native App ID must belong to the same primary App ID group/team. Verify an existing Apple account retains its Supabase UUID; do not merge accounts by email.
4. The owner enters these **server-only** values in staging secrets. Never put them in chat, source control, frontend configuration, or a variable beginning with `VITE_`:

   | Name | Value |
   | --- | --- |
   | `APPLE_SIGN_IN_PRIVATE_KEY` | Entire PEM content of the existing Apple sign-in key `AuthKey_AR6BG232HU.p8` (not the RevenueCat subscription key) |
   | `APPLE_SIGN_IN_KEY_ID` | `AR6BG232HU` |
   | `APPLE_SIGN_IN_TEAM_ID` | `CK3N6ZTEN8` |
   | `APPLE_TOKEN_ENCRYPTION_KEY` | A new random 32-byte base64 key, generated locally with `openssl rand -base64 32` |
   | `APPLE_WEB_REDIRECT_URI` | Exact staging origin + `/auth-callback`; production uses `https://parently-babytracking.com/auth-callback` |
   | `APPLE_DIRECT_AUTH_ENABLED` | `true` only after the migration, audiences and secrets are ready |

   Keep a secure backup of the encryption key. Changing it without re-encrypting existing rows makes stored tokens unusable. Keep server secrets available for deletion even if rolling the client back to broker login. The code generates a short-lived Apple client-secret JWT on demand.
5. Set build-time `VITE_APPLE_DIRECT_AUTH_ENABLED=true` only in the staging build being tested. Existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must point to that backend. This flag is public and contains no credential.
6. Build the web application and native shell together. `npx cap sync ios`, then open the Xcode project, select team CK3N6ZTEN8, regenerate provisioning profiles with Sign in with Apple, and verify the shell loads the intended staging URL. Xcode/native signing cannot be tested from this environment.

## Required acceptance tests

- Fresh Apple user with Hide My Email on iPhone and iPad; cancel/retry; returning user and web popup; preserve first-login name.
- Existing broker Apple user must resolve to the same Supabase UUID and data.
- Verify encrypted token rows are inaccessible through anon/authenticated clients and no Apple tokens appear in logs, local storage, URLs, or client bundles.
- Simulate storage failure: no application session should be installed. Retry with a fresh Apple authorization.
- Delete an Apple account from a different signed-in device, including web-created and native-created authorizations. Verify Apple revocation, data/Auth removal and cascade cleanup. Reauthorize and verify the consent flow appears again.
- Simulate an Apple outage during deletion: retain the login/data for retry and report failure. Verify legacy broker account deletion still offers manual disconnect.
- Sandbox subscription purchase/restore and Xcode archive remain separate release gates.

## Verification performed

TypeScript, changed-file lint, default and direct-enabled production web builds, and automated tests for signature/issuer/audience/nonce/expiry, authenticated encryption, token exchange/revocation failures, cross-client deletion and login ordering. No live Apple authorization or production data was used.

References: https://supabase.com/docs/guides/auth/social-login/auth-apple ; https://developer.apple.com/forums/thread/708415 ; https://developer.apple.com/videos/play/wwdc2022/10122/ ; https://docs.lovable.dev/features/apple-auth
