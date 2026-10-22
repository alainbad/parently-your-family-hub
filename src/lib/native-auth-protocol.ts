const CALLBACK = "com.parentlybabytracking.app://auth/callback";
const ORIGIN = "https://parently-babytracking.com";

export function nativeLoginUrl(provider: "apple" | "google", state: string) {
  if (!/^[a-f0-9]{64}$/.test(state)) throw new Error("Invalid authentication state.");
  const redirect = new URL("/native-auth-callback.html", ORIGIN);
  redirect.searchParams.set("native_state", state);
  const url = new URL("/~oauth/initiate", ORIGIN);
  url.search = new URLSearchParams({ provider, redirect_uri: redirect.href, state }).toString();
  return url.href;
}

export function nativeCallbackTokens(value: string, expectedState: string) {
  const url = new URL(value);
  if (
    `${url.protocol}//${url.host}${url.pathname}` !== CALLBACK ||
    url.search ||
    url.username ||
    url.password
  )
    throw new Error("Invalid sign-in callback.");
  const params = new URLSearchParams(url.hash.slice(1));
  if (
    !/^[a-f0-9]{64}$/.test(expectedState) ||
    params.getAll("native_state").length !== 1 ||
    params.get("native_state") !== expectedState
  )
    throw new Error("Sign-in session did not match. Please try again.");
  if (params.has("error")) throw new Error("Sign-in was not completed. Please try again.");
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (
    !access_token ||
    !refresh_token ||
    params.getAll("access_token").length !== 1 ||
    params.getAll("refresh_token").length !== 1
  )
    throw new Error("Sign-in returned no valid session.");
  return { access_token, refresh_token };
}
