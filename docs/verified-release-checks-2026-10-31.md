# Parently release checks — October 31, 2026

## Verified in the isolated Apple Auth Test environment

- Native iPhone and iPad Apple sign-in; web Apple sign-in with Hide My Email.
- Server Apple identity validation, authorization-code exchange, encrypted token retention, and account deletion with Apple revocation.
- Shared native/web Apple identity remained one Auth user in the test backend.
- iPad localized StoreKit paywall, purchase cancellation and retry.
- Physical iPhone sandbox subscription purchase, AI unlock, successful AI response and Restore purchase (owner confirmed October 31). Server logs independently show POST /api/chat 200.
- Missing/expired entitlement returns 403. Subscription provider failures deny access and now display an inline error/retry.
- RevenueCat customer-info GET works with the app's existing public App Store SDK key; this read-only lookup does not require the failing privileged secret. The server always derives the subscriber ID from the verified Auth user and checks live entitlement expiry/grace.
- Capacitor 8.5.3, RevenueCat 5.80.2, PurchasesHybridCommon 18.19.0 compiled and signed for the development iPhone build. Native bridge logging is disabled to protect Apple credentials.

## Production rollout remains required

The staging backend and its test Services ID are not production. This PR retains production Supabase configuration, bundle ID and native remote URL. Direct web Apple login uses a separately registered production Services ID, com.parentlybabytracking.app.web.direct, grouped with the native App ID. The existing broker Services ID and callbacks are preserved. Both direct-Apple activation flags remain disabled until production setup is complete.

1. Apply the existing apple_provider_tokens migration to production, preserving RLS and service-only access.
2. Configure production Apple Auth audiences for com.parentlybabytracking.app.web, com.parentlybabytracking.app.web.direct and com.parentlybabytracking.app. The legacy Services ID has ten website URL entries; register the new direct Services ID with domain parently-babytracking.com and Return URL https://parently-babytracking.com/auth-callback, preserving all legacy callbacks.
3. Owner enters production Apple signing key, key/team IDs, a distinct backed-up encryption key, exact web redirect URI, and server activation flag. No Apple private credentials were copied from staging or committed.
4. Deploy the reviewed code and activate client direct-Apple sign-in; verify returning production users preserve UUID/data, native/web login, and production-specific runtime behavior.
5. Archive/upload a production build (the installed test build must not be uploaded). Verify processed binary, subscription attachment, screenshots, privacy details, reviewer access and notes, and active Apple agreements before resubmission.

Always fully restart the native app after web publication. An existing document can keep calling its previous server revision, so a publication banner alone is not a runtime check.

## Production review checkout validation

October 31: TypeScript and all 28 regression tests pass. Default web build and changed-file lint pass. The production-targeted generic iOS build succeeds with signing team CK3N6ZTEN8; native configuration loads https://parently-babytracking.com with loggingBehavior none. Dependencies remain the tested Capacitor 8.5.3 / RevenueCat 5.80.2 graph. No test backend/domain/client ID is present in release source. An actual production account/login/purchase check, distribution archive/upload and App Review submission remain pending.
