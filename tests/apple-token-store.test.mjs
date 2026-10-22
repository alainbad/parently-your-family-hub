import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/apple-token-store.server.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
function harness(rows, queryError = null, revokeError = false, enabled = "true") {
  const exports = {};
  const calls = [];
  vm.runInNewContext(source, {
    exports,
    Error,
    process: { env: { APPLE_DIRECT_AUTH_ENABLED: enabled } },
    require: (name) => {
      if (name.includes("client.server"))
        return {
          supabaseAdmin: {
            from: (table) => {
              assert.equal(table, "apple_provider_tokens");
              return {
                select: () => ({
                  eq: async (column, user) => {
                    assert.equal(column, "user_id");
                    assert.equal(user, "user-a");
                    return { data: rows, error: queryError };
                  },
                }),
              };
            },
          },
        };
      if (name === "./apple-tokens.server")
        return {
          openAppleToken: async (_token, user, client) => {
            assert.equal(user, "user-a");
            return client;
          },
          revokeAppleToken: async (token, client) => {
            assert.equal(token, client);
            calls.push(client);
            if (revokeError) throw new Error("Apple unavailable");
          },
        };
      throw new Error(name);
    },
  });
  return { run: () => exports.revokeStoredAppleTokens("user-a"), calls };
}
test("deletion revokes both stored Apple clients", async () => {
  const h = harness([
    { client_id: "ios", encrypted_token: "one" },
    { client_id: "web", encrypted_token: "two" },
  ]);
  assert.equal(await h.run(), true);
  assert.deepEqual(h.calls, ["ios", "web"]);
});
test("Apple or storage failure does not report revocation success", async () => {
  await assert.rejects(harness([{ client_id: "ios", encrypted_token: "one" }], null, true).run());
  await assert.rejects(harness(null, { code: "network_failure" }).run());
  await assert.rejects(harness(null, { code: "PGRST205" }).run());
});
test("legacy accounts without tokens use fallback; only disabled integration tolerates absent migration", async () => {
  assert.equal(await harness([]).run(), false);
  assert.equal(await harness(null, { code: "PGRST205" }, false, "false").run(), false);
});
