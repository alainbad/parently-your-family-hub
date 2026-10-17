# October 2026 App Review fixes — NOT ready to resubmit

Review rejected version 1.0 (1). This branch prepares build 2; choose a higher number if 2 has already been uploaded. Native Swift compilation and device testing require Xcode and have not been performed here.

## Implemented

- Apple and Google OAuth use Supabase PKCE; iOS presents ASWebAuthenticationSession through a local Capacitor plugin, rather than launching the default browser. Email login and registration remain inside the app.
- Apple login button, exact callback validation, native plugin registration, callback URL scheme, and email confirmation feedback.
- RevenueCat keys read from environment; initialization failures are caught and can be retried. Purchase and restore actions handle setup errors.
- Storefront price replaces the hardcoded price. Subscribe does not promise an unverified free trial; Apple displays eligible offers before confirmation. Added renewal disclosure, terms, privacy, restore, and loading/error states.
- Removed reviewer-email and localStorage subscription bypasses. AI endpoint verifies the authenticated user's RevenueCat entitlement, including billing grace periods.

## Required configuration before deployment

1. In Supabase Auth enable BOTH Google and Apple providers. This branch replaces the Lovable Google proxy with direct Supabase OAuth; do not deploy before Google credentials are configured.
2. Allow redirect URLs `com.parentlybabytracking.app://auth/callback` and `https://parently-babytracking.com/auth-callback`. Add the exact staging callback when testing staging.
3. Configure Apple's Services ID, associated primary App ID, web domain, key and signed client secret. Apple's return URL is `https://emyrcjsikkdnublfudmj.supabase.co/auth/v1/callback`. Track client-secret expiration. Configure Google's redirect to that same Supabase callback. The native plugin intentionally permits only this project's Supabase authorize URL; update that host if using a custom Auth domain.
4. **Apple account-deletion token revocation remains unimplemented.** Before releasing Apple login, implement secure server-side retention of the Apple provider refresh token associated with the verified user and revoke through Apple's `/auth/revoke` before completing account deletion. Do not put Apple private keys or provider refresh tokens in client code or public tables. Existing account deletion removes app data/Auth but does not revoke Apple authorization. Verify hide-email, subsequent logins and deletion from another device.
5. Set `VITE_REVENUECAT_APPLE_API_KEY` to the real Apple SDK public key (`appl_...`) in the web build environment. For Android set `VITE_REVENUECAT_GOOGLE_API_KEY`. Set `REVENUECAT_SECRET_API_KEY` only in the server runtime environment, with access to RevenueCat v1 subscriber information. Without it AI requests return 503; never prefix this secret with VITE.
6. In RevenueCat connect the correct App Store app, configure Apple service credentials, import `parently_ai_chat_monthly`, attach it to entitlement `ai_chat`, and include it in the current offering. SDK app user IDs are Supabase user UUIDs.
7. In App Store Connect finish the subscription's localization, price, availability, review screenshot, and optional introductory trial. Confirm Paid Apps Agreement is active, complete required business information, and attach the subscription to the app-version submission.

## Verification and release

- Automated: TypeScript check, production web build, lint for changed TypeScript files, account-deletion tests, entitlement tests. These do not prove native sign-in or StoreKit works.
- On a staging deployment with the above settings, run `npm ci`, `npm run build`, `npx cap sync ios`; open the iOS project in Xcode. The native shell loads the configured remote URL, so deploy the matching web code and point staging builds to staging explicitly.
- Test fresh install on iPhone AND iPad: email registration/confirmation/login, Google login/cancel/retry, Apple login with Hide My Email, sign out and switch accounts, account deletion and Apple revocation.
- Sandbox test: localized price, eligible and ineligible trial accounts, buy/cancel, restore on reinstall, expired entitlement, billing grace, network failure and retry. Verify a purchase actually enables `/api/chat`, and a non-subscriber cannot call it directly. Do not use a reviewer-only unlock to claim StoreKit works.
- Only after all release gates pass: archive build 2 (or higher), upload, select the processed build, attach IAP and review screenshot, supply working review credentials, reply with verified changes, and resubmit.

## Access limitations

GitHub access works. The connected Lovable account returned `project_not_found` for this project, and the previously connected Supabase accounts did not have project permission. Apple/RevenueCat dashboard configuration and native device testing were not available in this workspace.
