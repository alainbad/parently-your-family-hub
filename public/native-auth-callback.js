// Standalone broker return page: no app session storage, analytics, or third-party scripts.
(() => {
  const source = new URL(window.location.href);
  window.history.replaceState(null, "", source.pathname);
  const state = source.searchParams.get("native_state");
  if (!state || !/^[a-f0-9]{64}$/.test(state)) {
    document.getElementById("status").textContent =
      "Sign-in expired. Close this window and try again in Parently.";
    return;
  }
  const input = new URLSearchParams(source.hash.slice(1));
  const output = new URLSearchParams({ native_state: state });
  if (
    input.has("error") ||
    source.searchParams.has("error") ||
    !input.get("access_token") ||
    !input.get("refresh_token")
  ) {
    output.set("error", "authentication_failed");
  } else {
    output.set("access_token", input.get("access_token"));
    output.set("refresh_token", input.get("refresh_token"));
  }
  window.location.replace("com.parentlybabytracking.app://auth/callback#" + output.toString());
})();
