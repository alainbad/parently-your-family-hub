# October 2026 App Review fixes — NOT ready to resubmit

Review rejected version 1.0 (1). This branch prepares build 2; choose a higher number if 2 has already been uploaded. Native Swift compilation and device testing require Xcode and have not been performed here.

## Implemented

- Web Apple and Google OAuth use the Lovable Cloud broker matching the saved provider configuration. The iOS draft now opens the same broker in ASWebAuthenticationSession and uses a standalone HTTPS return page to hand the session back to the app. Each attempt validates a random 256-bit state and exact callback. Broker acceptance of this return URL and the native flow MUST be tested on staging/devices before release. Email login and registration remain inside the app.
- Apple login button, exact callback validation, native plugin registration, callback URL scheme, and email confirmation feedback.
- RevenueCat keys read from environment; initialization failures are caught and can be retried. Purchase and restore actions handle setup errors.
- Storefront price replaces the hardcoded price. Subscribe does not promise an unverified free trial; Apple displays eligible offers before confirmation. Added renewal disclosure, terms, privacy, restore, and loading/error states.
- Removed reviewer-email and localStorage subscription bypasses. AI endpoint verifies the authenticated user's RevenueCat entitlement, including billing grace periods.

## Required configuration before deployment

1. Apple and Google are enabled in Lovable Cloud. Apple uses Services ID `com.parentlybabytracking.app.web`, team `CK3N6ZTEN8`, key ID `AR6BG232HU`. The user generated and saved the client secret on 2026-10-17. Keep the private key out of this repository. Verify end-to-end login; an enabled provider alone does not prove credential validity.
2. Allow the broker return URL `https://parently-babytracking.com/native-auth-callback.html` (including its per-attempt `native_state` query) and web return `https://parently-babytracking.com/auth-callback`. The native custom scheme is used only by the standalone return page. Add the exact staging callback when testing staging.
3. Lovable's Apple return URLs are `https://oauth.lovable.app/callback`, `https://parently-babytracker.lovable.app/~oauth/callback`, `https://parently-babytracking.com/~oauth/callback`, and `https://www.parently-babytracking.com/~oauth/callback`. These were prepared in Apple Developer and the user reported saving them. All four confirmations are checked in Lovable. The previously registered direct Supabase callback is not used by the web broker. Verify the broker preserves the HTTPS return page query and supplies session tokens in the fragment; do not assume it accepts arbitrary custom schemes or returns a Supabase PKCE code. Track client-secret expiration and regenerate before six months.
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

GitHub access works. Browser access to Lovable works under `alainbadran2021@outlook.com`; the connector is linked to a different account and cannot access this project. Apple Developer setup is accessible through the browser. RevenueCat configuration and native device testing remain unverified.

## October 22 follow-up

Merged current Lovable main changes into this draft without rewriting history. Native broker relay implementation and callback validation tests added; Xcode compilation and device flow remain unverified. App Store Connect shows an AI-Chat subscription group. A new Developer Program License Agreement requires Account Holder review/acceptance before updates/submission. RevenueCat is signed out; configuration remains blocked until the owner signs in. Apple token revocation remains a release blocker.

Verified October 22: production web build and TypeScript pass; all 10 tests pass. App Store subscription `parently_ai_chat_monthly` is one month, Prepare for Submission, available in all regions, with English localization and an existing review screenshot. Screenshot suitability and configured prices still need checking against the final paywall.
