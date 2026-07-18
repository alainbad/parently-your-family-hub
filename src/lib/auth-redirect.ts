import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SEARCH_KEYS_TO_REMOVE = ["code", "error", "error_code", "error_description"];
const HASH_KEYS_TO_REMOVE = [
  "access_token",
  "refresh_token",
  "expires_at",
  "expires_in",
  "provider_token",
  "token_type",
  "type",
  "error",
  "error_code",
  "error_description",
];

function cleanOAuthUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  let changed = false;

  for (const key of SEARCH_KEYS_TO_REMOVE) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (url.hash.length > 1) {
    const hashParams = new URLSearchParams(url.hash.slice(1));
    for (const key of HASH_KEYS_TO_REMOVE) {
      if (hashParams.has(key)) {
        hashParams.delete(key);
        changed = true;
      }
    }
    const hash = hashParams.toString();
    url.hash = hash ? `#${hash}` : "";
  }

  if (changed) {
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

export async function restoreOAuthSessionFromUrl(): Promise<{
  session: Session | null;
  error: string | null;
}> {
  if (typeof window === "undefined") return { session: null, error: null };

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const searchParams = new URLSearchParams(window.location.search);
  const urlError = hashParams.get("error_description") ?? searchParams.get("error_description");

  if (urlError) {
    cleanOAuthUrl();
    return { session: null, error: urlError };
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    cleanOAuthUrl();
    return { session: data.session, error: error?.message ?? null };
  }

  const code = searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    cleanOAuthUrl();
    return { session: data.session, error: error?.message ?? null };
  }

  return { session: null, error: null };
}