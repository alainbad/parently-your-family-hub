import test from "node:test";
import assert from "node:assert/strict";
import { nativeCallbackTokens, nativeLoginUrl } from "../src/lib/native-auth-protocol.ts";
const state = "a".repeat(64);
const callback = `com.parentlybabytracking.app://auth/callback#native_state=${state}&access_token=access&refresh_token=refresh`;
test("native login targets broker and binds HTTPS relay to this attempt", () => {
  const url = new URL(nativeLoginUrl("apple", state));
  assert.equal(url.origin + url.pathname, "https://parently-babytracking.com/~oauth/initiate");
  const redirect = new URL(url.searchParams.get("redirect_uri"));
  assert.equal(redirect.pathname, "/native-auth-callback.html");
  assert.equal(redirect.searchParams.get("native_state"), state);
});
test("callback accepts only matching session and exact return destination", () => {
  assert.deepEqual(nativeCallbackTokens(callback, state), {
    access_token: "access",
    refresh_token: "refresh",
  });
  for (const value of [
    callback.replace("auth/callback", "other/callback"),
    callback.replace(state, "b".repeat(64)),
    callback + "&access_token=other",
    callback.replace("&refresh_token=refresh", ""),
    callback + "&error=denied",
  ]) {
    assert.throws(() => nativeCallbackTokens(value, state));
  }
});
