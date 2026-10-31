import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SEARCH_KEYS_TO_REMOVE = ["code", "error", "error_code", "error_description"];
const HASH_KEYS_TO_REMOVE = [
  "access_token",
  "refresh_token",
  "expires_at",
  "expires_in",
  "provider_token",
  "provider_refresh_token",
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
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
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

  if (urlError || hashParams.has("error") || searchParams.has("error")) {
    cleanOAuthUrl();
    return { session: null, error: "Sign-in was not completed. Please try again." };
  }

  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  if (accessToken && refreshToken) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return {
        session: data.session,
        error: error ? "Sign-in could not be completed. Please try again." : null,
      };
    } catch {
      return { session: null, error: "Sign-in could not be completed. Please try again." };
    } finally {
      cleanOAuthUrl();
    }
  }

  const code = searchParams.get("code");
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      return {
        session: data.session,
        error: error ? "Sign-in could not be completed. Please try again." : null,
      };
    } catch {
      return { session: null, error: "Sign-in could not be completed. Please try again." };
    } finally {
      cleanOAuthUrl();
    }
  }

  if (accessToken || refreshToken) {
    cleanOAuthUrl();
    return { session: null, error: "Sign-in returned an incomplete session. Please try again." };
  }
  return { session: null, error: null };
}
