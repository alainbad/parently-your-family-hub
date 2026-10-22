import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/native-auth.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText.replace("import.meta.env.VITE_APPLE_DIRECT_AUTH_ENABLED", "false");
function harness(result, setSession) {
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    window: { location: { origin: "https://parently.example" } },
    require: (name) => {
      if (name === "@capacitor/core")
        return { Capacitor: { getPlatform: () => "web" }, registerPlugin: () => ({}) };
      if (name === "@lovable.dev/cloud-auth-js")
        return { createLovableAuth: () => ({ signInWithOAuth: async () => result }) };
      if (name.includes("supabase/client")) return { supabase: { auth: { setSession } } };
      return {};
    },
  });
  return exports.signInWithProvider;
}
test("web popup rejects session errors and missing sessions", async () => {
  const result = { tokens: { access_token: "a", refresh_token: "r" }, error: null };
  for (const response of [
    { data: { session: null }, error: new Error("expired") },
    { data: { session: null }, error: null },
  ]) {
    await assert.rejects(harness(result, async () => response)("apple"));
  }
});
test("web redirects do not exchange absent tokens; popup success installs tokens", async () => {
  let calls = 0;
  await harness({ redirected: true, error: null }, async () => {
    calls++;
  })("apple");
  assert.equal(calls, 0);
  const tokens = { access_token: "a", refresh_token: "r" };
  await harness({ tokens, error: null }, async (received) => {
    assert.deepEqual(received, tokens);
    calls++;
    return { data: { session: { user: { id: "user" } } }, error: null };
  })("apple");
  assert.equal(calls, 1);
});
