import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomBytes, createHash } from "node:crypto";
import ts from "typescript";
import { generateKeyPair, SignJWT, exportPKCS8 } from "jose";
const source = ts
  .transpileModule(
    readFileSync(new URL("../src/lib/apple-tokens.server.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
  )
  .outputText.replace('from "jose"', `from "${import.meta.resolve("jose")}"`);
const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
process.env.APPLE_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
const signing = await generateKeyPair("ES256", { extractable: true });
process.env.APPLE_SIGN_IN_PRIVATE_KEY = await exportPKCS8(signing.privateKey);
process.env.APPLE_SIGN_IN_KEY_ID = "TESTKEY";
process.env.APPLE_SIGN_IN_TEAM_ID = "TESTTEAM";
process.env.APPLE_WEB_REDIRECT_URI = "https://test.example/auth-callback";
const client = api.APPLE_CLIENTS.ios;
const nonce = "a".repeat(64);
const hash = createHash("sha256").update(nonce).digest("hex");
const keys = await generateKeyPair("RS256");
async function idToken(overrides = {}, key = keys.privateKey) {
  return new SignJWT({
    sub: "apple-user",
    iss: "https://appleid.apple.com",
    aud: client,
    nonce: hash,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300,
    ...overrides,
  })
    .setProtectedHeader({ alg: "RS256" })
    .sign(key);
}
test("encrypted tokens are bound to user and Apple client and reject tampering", async () => {
  const encrypted = await api.sealAppleToken("private-refresh", "user-a", client);
  assert.ok(!encrypted.includes("private-refresh"));
  assert.equal(await api.openAppleToken(encrypted, "user-a", client), "private-refresh");
  await assert.rejects(api.openAppleToken(encrypted, "user-b", client));
  await assert.rejects(api.openAppleToken(encrypted, "user-a", api.APPLE_CLIENTS.web));
  const parts = encrypted.split(".");
  parts[3] = (parts[3][0] === "A" ? "B" : "A") + parts[3].slice(1);
  await assert.rejects(api.openAppleToken(parts.join("."), "user-a", client));
});
test("Apple identity requires valid signature, issuer, audience, expiry and nonce", async () => {
  const resolver = async () => keys.publicKey;
  assert.equal(
    await api.verifyAppleIdentity(await idToken(), client, nonce, resolver),
    "apple-user",
  );
  for (const overrides of [
    { aud: "other-app" },
    { iss: "https://attacker.example" },
    { nonce: "wrong" },
    { exp: 1 },
    { iat: 1 },
  ]) {
    await assert.rejects(
      api.verifyAppleIdentity(await idToken(overrides), client, nonce, resolver),
    );
  }
  const other = await generateKeyPair("RS256");
  await assert.rejects(
    api.verifyAppleIdentity(await idToken({}, other.privateKey), client, nonce, resolver),
  );
});
test("exchange sends code only to Apple and includes redirect only for web", async () => {
  for (const clientId of Object.values(api.APPLE_CLIENTS)) {
    const result = await api.exchangeAppleCode("one-time-code", clientId, async (url, options) => {
      assert.equal(url, "https://appleid.apple.com/auth/token");
      assert.equal(options.body.get("code"), "one-time-code");
      assert.equal(options.body.get("client_id"), clientId);
      assert.equal(options.body.has("redirect_uri"), clientId === api.APPLE_CLIENTS.web);
      return Response.json({ refresh_token: "refresh", id_token: "identity" });
    });
    assert.equal(result.refreshToken, "refresh");
  }
  await assert.rejects(
    api.exchangeAppleCode(
      "code",
      client,
      async () => new Response("secret provider error", { status: 400 }),
    ),
    (error) => !error.message.includes("secret provider"),
  );
  await assert.rejects(
    api.exchangeAppleCode("code", client, async () => Response.json({ id_token: "identity" })),
  );
});
test("revocation must succeed and sends refresh token in POST body only", async () => {
  await api.revokeAppleToken("refresh-secret", client, async (url, options) => {
    assert.equal(url, "https://appleid.apple.com/auth/revoke");
    assert.equal(options.method, "POST");
    assert.equal(options.body.get("token"), "refresh-secret");
    assert.equal(options.body.get("token_type_hint"), "refresh_token");
    return new Response(null, { status: 200 });
  });
  await assert.rejects(
    api.revokeAppleToken("refresh-secret", client, async () => new Response(null, { status: 500 })),
  );
});
test("signing accepts pasted whitespace and escaped line endings, rejects malformed keys before sending", async () => {
  const original = process.env.APPLE_SIGN_IN_PRIVATE_KEY;
  try {
    for (const formatted of ["\ufeff \n" + original + "\n ", original.replace(/\n/g, "\\r\\n")]) {
      process.env.APPLE_SIGN_IN_PRIVATE_KEY = formatted;
      let called = false;
      await api.exchangeAppleCode("code", client, async () => {
        called = true;
        return Response.json({ refresh_token: "refresh", id_token: "identity" });
      });
      assert.equal(called, true);
    }
    process.env.APPLE_SIGN_IN_PRIVATE_KEY = "not-a-private-key";
    await assert.rejects(api.exchangeAppleCode("code", client, async () => {
      assert.fail("Malformed keys must not reach Apple");
    }), /Apple sign-in is not configured correctly/);
  } finally {
    process.env.APPLE_SIGN_IN_PRIVATE_KEY = original;
  }
});
