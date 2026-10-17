import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

const NativeAuth = registerPlugin<{ start(options: { url: string }): Promise<{ url: string }> }>(
  "NativeAuth",
);
const CALLBACK = "com.parentlybabytracking.app://auth/callback";

export async function signInWithProvider(provider: "google" | "apple") {
  const ios = Capacitor.getPlatform() === "ios";
  if (ios && !Capacitor.isPluginAvailable("NativeAuth")) {
    throw new Error("Please update Parently to use secure sign-in, or sign in with email.");
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: ios ? CALLBACK : `${window.location.origin}/auth-callback`,
      skipBrowserRedirect: ios,
      ...(provider === "google" ? { queryParams: { prompt: "select_account" } } : {}),
    },
  });
  if (error) throw error;
  if (!ios) return;
  if (!data.url) throw new Error("Unable to start sign-in.");
  const result = await NativeAuth.start({ url: data.url });
  const callback = new URL(result.url);
  if (`${callback.protocol}//${callback.host}${callback.pathname}` !== CALLBACK) {
    throw new Error("Invalid sign-in callback.");
  }
  if (callback.searchParams.has("error"))
    throw new Error("Sign-in was not completed. Please try again.");
  const code = callback.searchParams.get("code");
  if (!code) throw new Error("Sign-in returned no authorization code.");
  const exchanged = await supabase.auth.exchangeCodeForSession(code);
  if (exchanged.error) throw exchanged.error;
}
