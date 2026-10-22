import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/auth-redirect.ts", import.meta.url), "utf8"),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  },
).outputText;
function harness(fragment, auth) {
  let current = new URL("https://parently.example/auth-callback" + fragment);
  const exports = {};
  const context = {
    exports,
    URL,
    URLSearchParams,
    require: () => ({ supabase: { auth } }),
    window: {
      get location() {
        return current;
      },
      history: {
        state: null,
        replaceState(_state, _title, value) {
          current = new URL(value, current);
        },
      },
    },
  };
  vm.runInNewContext(source, context);
  return { restore: exports.restoreOAuthSessionFromUrl, url: () => current };
}
test("cleans session and provider tokens even when session creation throws", async () => {
  const h = harness(
    "#access_token=access&refresh_token=refresh&provider_refresh_token=private&keep=value",
    {
      setSession: async () => {
        throw new Error("provider details");
      },
    },
  );
  const result = await h.restore();
  assert.equal(result.session, null);
  assert.ok(result.error);
  assert.equal(h.url().hash, "#keep=value");
  assert.ok(!result.error.includes("provider details"));
});
test("cleans expired PKCE code when exchange throws", async () => {
  const h = harness("?code=expired", {
    exchangeCodeForSession: async () => {
      throw new Error("expired");
    },
  });
  assert.ok((await h.restore()).error);
  assert.equal(h.url().search, "");
});
test("rejects incomplete and error-only callbacks without session creation", async () => {
  for (const value of [
    "#access_token=only",
    "?error=access_denied",
    "#error=denied&refresh_token=secret",
  ]) {
    const h = harness(value, {});
    assert.ok((await h.restore()).error);
    assert.equal(h.url().hash, "");
    assert.equal(h.url().search, "");
  }
});
