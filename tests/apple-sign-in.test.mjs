import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";
const source = ts
  .transpileModule(readFileSync(new URL("../src/lib/apple-sign-in.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  .outputText.replace(/import.meta.env.VITE_SUPABASE_URL/g, '"https://test.example"')
  .replace(/import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY/g, '"public-key"');
function harness(failRetention = false, rejectIdentity = false) {
  const calls = [];
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    crypto: webcrypto,
    Error,
    require: (name) => {
      if (name === "@supabase/supabase-js")
        return {
          createClient: (_url, _key, opts) => {
            assert.equal(opts.auth.persistSession, false);
            return {
              auth: {
                signInWithIdToken: async () => {
                  calls.push("verify");
                  return {
                    data: {
                      session: rejectIdentity
                        ? null
                        : { access_token: "session", refresh_token: "refresh" },
                    },
                    error: null,
                  };
                },
                signOut: async () => {
                  calls.push("discard");
                },
              },
            };
          },
        };
      if (name === "@capacitor/core")
        return {
          Capacitor: { getPlatform: () => "ios", isPluginAvailable: () => true },
          registerPlugin: () => ({
            apple: async ({ nonce }) => {
              assert.match(nonce, /^[a-f0-9]{64}$/);
              return { identityToken: "apple-jwt", authorizationCode: "apple-code" };
            },
          }),
        };
      if (name === "./apple-auth")
        return {
          retainAppleAuthorization: async ({ data }) => {
            calls.push("retain");
            assert.equal(data.accessToken, "session");
            assert.equal(data.code, "apple-code");
            if (failRetention) throw new Error("storage unavailable");
          },
        };
      if (name.includes("supabase/client"))
        return {
          supabase: {
            auth: {
              setSession: async () => {
                calls.push("install");
                return { data: { session: {} }, error: null };
              },
            },
          },
        };
      throw new Error(name);
    },
  });
  return { run: exports.directAppleSignIn, calls };
}
test("native Apple login retains authorization before publishing the session", async () => {
  const h = harness();
  await h.run();
  assert.deepEqual(h.calls, ["verify", "retain", "install"]);
});
test("failed retention never publishes a session and permits retry", async () => {
  const h = harness(true);
  await assert.rejects(h.run());
  await assert.rejects(h.run());
  assert.deepEqual(h.calls, ["verify", "retain", "discard", "verify", "retain", "discard"]);
});
test("invalid Apple identity never reaches token retention", async () => {
  const h = harness(false, true);
  await assert.rejects(h.run());
  assert.deepEqual(h.calls, ["verify", "discard"]);
});
