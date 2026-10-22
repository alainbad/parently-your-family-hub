import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const NativeAuth = registerPlugin<{
  start(options: { url: string }): Promise<{ url: string }>;
  addListener(event: "appleCredentialRevoked", callback: () => void): Promise<PluginListenerHandle>;
}>("NativeAuth");

export async function observeAppleRevocation(callback: () => void): Promise<() => void> {
  if (Capacitor.getPlatform() !== "ios" || !Capacitor.isPluginAvailable("NativeAuth"))
    return () => {};
  const listener = await NativeAuth.addListener("appleCredentialRevoked", callback);
  return () => {
    void listener.remove();
  };
}
import { nativeCallbackTokens, nativeLoginUrl } from "./native-auth-protocol";

export async function signInWithProvider(provider: "google" | "apple") {
  const ios = Capacitor.getPlatform() === "ios";
  // Lovable Cloud providers are configured at its OAuth broker, not at the
  // project's direct Supabase authorize endpoint.
  if (!ios) {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/auth-callback`,
      ...(provider === "google" ? { extraParams: { prompt: "select_account" } } : {}),
    });
    if (result.error) throw result.error;
    return;
  }
  if (ios && !Capacitor.isPluginAvailable("NativeAuth")) {
    throw new Error("Please update Parently to use secure sign-in, or sign in with email.");
  }
  const state = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const result = await NativeAuth.start({ url: nativeLoginUrl(provider, state) });
  const tokens = nativeCallbackTokens(result.url, state);
  const { data, error } = await supabase.auth.setSession(tokens);
  if (error) throw error;
  if (!data.session) throw new Error("Sign-in did not create a session. Please try again.");
}
