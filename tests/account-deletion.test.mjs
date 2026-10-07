import test from "node:test";
import assert from "node:assert/strict";
import { eraseAccount } from "../src/lib/account-deletion.server.ts";

function fixture(failAt) {
  const own = "user-a",
    other = "user-b";
  const tables = Object.fromEntries(
    [
      "chat_messages",
      "chat_threads",
      "quick_logs",
      "baby_logs",
      "growth_measurements",
      "reminders",
      "milestone_records",
      "affiliate_clicks",
      "household_members",
    ].map((t) => [t, [{ user_id: own }, { user_id: other }]]),
  );
  tables.profiles = [{ id: own }, { id: other }];
  tables.households = [{ owner_id: own }, { owner_id: other }];
  tables.household_invites = [
    { created_by: own, accepted_by: other },
    { created_by: other, accepted_by: own },
  ];
  const files = Array.from(
    { length: 205 },
    (_, i) => `${own}/photo-${String(i).padStart(3, "0")}.jpg`,
  );
  files.push(`${other}/keep.jpg`);
  const calls = [];
  const client = {
    from(table) {
      const filter = (action, payload) => ({
        eq: async (key, value) => {
          calls.push(table);
          if (table === failAt) return { error: new Error("unavailable") };
          if (action === "delete") tables[table] = tables[table].filter((r) => r[key] !== value);
          else
            tables[table].forEach((r) => {
              if (r[key] === value) Object.assign(r, payload);
            });
          return { error: null };
        },
      });
      return { delete: () => filter("delete"), update: (p) => filter("update", p) };
    },
    storage: {
      from: () => ({
        list: async (prefix, { offset, limit }) => ({
          data: files
            .filter((p) => p.startsWith(prefix + "/"))
            .slice(offset, offset + limit)
            .map((p) => ({ id: p, name: p.slice(prefix.length + 1) })),
          error: failAt === "storage" ? new Error("storage failed") : null,
        }),
        remove: async (paths) => {
          calls.push("storage");
          paths.forEach((p) => files.splice(files.indexOf(p), 1));
          return { error: null };
        },
      }),
    },
    auth: {
      admin: {
        signOut: async (token, scope) => {
          assert.equal(token, "token-a");
          assert.equal(scope, "global");
          calls.push("signOut");
          return { error: null };
        },
        deleteUser: async (id, soft) => {
          assert.equal(id, own);
          assert.equal(soft, false);
          calls.push("deleteUser");
          return { error: failAt === "auth" ? new Error("auth failed") : null };
        },
      },
    },
  };
  return { client, tables, files, calls };
}
test("deletes all 205 photos and personal records, preserves other users, revokes sessions before hard deletion", async () => {
  const f = fixture();
  await eraseAccount(f.client, "user-a", "token-a");
  assert.deepEqual(f.files, ["user-b/keep.jpg"]);
  for (const [name, rows] of Object.entries(f.tables)) {
    assert.equal(rows.length, 1, name);
    assert.ok(!JSON.stringify(rows).includes("user-a"), name);
  }
  assert.deepEqual(f.calls.slice(-2), ["signOut", "deleteUser"]);
});
test("storage failure stops before any account/database deletion", async () => {
  const f = fixture("storage");
  await assert.rejects(eraseAccount(f.client, "user-a", "token-a"));
  assert.deepEqual(f.calls, []);
  assert.equal(f.tables.profiles.length, 2);
});
test("partial failure never deletes login; retry safely completes remaining cleanup", async () => {
  const f = fixture("baby_logs");
  await assert.rejects(eraseAccount(f.client, "user-a", "token-a"));
  assert.ok(!f.calls.includes("deleteUser"));
  assert.equal(f.tables.profiles.length, 2);
});
test("cleanup can run twice without removing another user data", async () => {
  const f = fixture();
  await eraseAccount(f.client, "user-a", "token-a");
  await eraseAccount(f.client, "user-a", "token-a");
  assert.deepEqual(f.files, ["user-b/keep.jpg"]);
  assert.equal(f.tables.profiles[0].id, "user-b");
});
test("auth deletion error is propagated, never treated as success", async () => {
  const f = fixture("auth");
  await assert.rejects(eraseAccount(f.client, "user-a", "token-a"));
});
