# Account deletion release and App Review

Implemented in Profile → Account → Delete Account. Type DELETE, then choose
Permanently delete account. A success screen follows backend completion.

## Release

Publish the synced main branch in the existing Parently Lovable project. The
Capacitor iOS shell loads https://parently-babytracking.com. Confirm the deployed
server has SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY
configured for the same project as the browser client. Keep the service role key
server-only. This implementation needs no new table or database migration.

## Required live verification (not yet performed)

Use disposable accounts, never a real family or the standing review account.

1. Create two accounts, add sample logs, a baby photo, AI conversation and a family
   invitation. Also test one account without any records or family membership.
2. Cancel the deletion dialog and confirm no records changed.
3. Delete the family member. Verify their data and all uploaded photo versions are
   removed; the other user's account and records remain.
4. Repeat with a disposable family owner. Verify the owned group and invitations
   are removed, but other users and their own records remain.
5. Verify the deleted account cannot sign in or refresh a session. Query every
   user-associated table and Storage to confirm no personal records remain.
6. If any provider operation fails, the app must display an error, never success.
   Cleanup is sequential and repeatable, not transactional across Auth, Storage
   and Postgres. Some data may already be removed on error; retry completes the
   remaining steps. If final Auth deletion fails after session revocation, sign
   in again to retry. Do not approve a release without live verification.
7. Verify on a physical iPhone that subscription links open and deletion remains
   available without cancelling a subscription first.

## Apple recording

Record on a physical iPhone: sign in/create a disposable account → Profile →
Delete Account → confirmation → Account deleted. Attach it to the review reply
and include a reviewer-accessible link in App Review Information → Notes.
Do not claim recording or live verification is complete until actually performed.

## Local verification

- npm run build
- npx tsc --noEmit
- node --test tests/account-deletion.test.mjs
- ESLint on the changed TypeScript files

The deletion tests use an in-memory provider mock; they do not prove deployment
configuration or live Supabase behavior. Review live foreign keys and tables
before release, especially if the database has diverged from checked-in schema.
