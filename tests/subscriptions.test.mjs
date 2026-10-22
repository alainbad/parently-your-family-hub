import test from "node:test";
import assert from "node:assert/strict";
import { entitlementIsActive, userHasAiSubscription } from "../src/lib/subscriptions.server.ts";
const now = Date.parse("2026-10-17T12:00:00Z");
test("missing, malformed and expired entitlements deny access", () => {
  for (const value of [
    undefined,
    {},
    { expires_date: "invalid" },
    { expires_date: new Date(now).toISOString() },
  ]) {
    assert.equal(entitlementIsActive(value, now), false);
  }
});
test("active, lifetime and billing grace entitlements retain access", () => {
  assert.equal(entitlementIsActive({ expires_date: null }, now), true);
  assert.equal(
    entitlementIsActive({ expires_date: new Date(now + 1000).toISOString() }, now),
    true,
  );
  assert.equal(
    entitlementIsActive(
      {
        expires_date: new Date(now - 1000).toISOString(),
        grace_period_expires_date: new Date(now + 1000).toISOString(),
      },
      now,
    ),
    true,
  );
});
test("provider errors fail closed, never grant access", async () => {
  const original = globalThis.fetch;
  const originalKey = process.env.REVENUECAT_SECRET_API_KEY;
  try {
    process.env.REVENUECAT_SECRET_API_KEY = "test";
    globalThis.fetch = async () => new Response("", { status: 503 });
    await assert.rejects(userHasAiSubscription("test-user"));
    globalThis.fetch = async () => new Response("{}");
    await assert.rejects(userHasAiSubscription("test-user"));
    globalThis.fetch = async () => new Response("", { status: 404 });
    assert.equal(await userHasAiSubscription("test-user"), false);
  } finally {
    globalThis.fetch = original;
    if (originalKey === undefined) delete process.env.REVENUECAT_SECRET_API_KEY;
    else process.env.REVENUECAT_SECRET_API_KEY = originalKey;
  }
});
