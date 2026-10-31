import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { checkAppleSignInConfiguration, retainAppleAuthorization } from "./apple-auth";

type AppleResponse = { identityToken: string; authorizationCode: string; fullName?: string };
type AppleJS = {
  auth: {
    init(options: {
      clientId: string;
      scope: string;
      redirectURI: string;
      state: string;
      nonce: string;
      usePopup: boolean;
    }): void;
    signIn(): Promise<{
      authorization: { id_token: string; code: string; state: string };
      user?: { name?: { firstName?: string; lastName?: string } };
    }>;
  };
};
declare global {
  interface Window {
    AppleID?: AppleJS;
  }
}
const native = registerPlugin<{ apple(options: { nonce: string }): Promise<AppleResponse> }>(
  "NativeAuth",
);
let sdkLoad: Promise<AppleJS> | undefined;
let signingIn = false;
function randomNonce() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
async function loadAppleJS(): Promise<AppleJS> {
  if (window.AppleID) return window.AppleID;
  if (!sdkLoad)
    sdkLoad = new Promise<AppleJS>((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => {
        script.remove();
        reject(new Error("Apple sign-in could not load. Please retry."));
      };
      const timer = window.setTimeout(fail, 15000);
      script.src =
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = () => {
        window.clearTimeout(timer);
        if (window.AppleID) resolve(window.AppleID);
        else fail();
      };
      script.onerror = () => {
        window.clearTimeout(timer);
        fail();
      };
      document.head.appendChild(script);
    }).catch((error) => {
      sdkLoad = undefined;
      throw error;
    });
  return sdkLoad;
}
export async function directAppleSignIn() {
  if (signingIn) throw new Error("Apple sign-in is already in progress.");
  signingIn = true;
  // Keep this session out of shared storage and AuthProvider until the server
  // has retained the Apple authorization. Failed retention must not log in.
  let pendingAuth: SupabaseClient | undefined;
  try {
    // Fail before asking the owner for Apple's system confirmation when server setup is incomplete.
    await checkAppleSignInConfiguration();
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Apple sign-in is not configured yet.");
    pendingAuth = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "parently-apple-pending",
      },
    });
    const nonce = randomNonce();
    const platform = Capacitor.getPlatform() === "ios" ? "ios" : "web";
    let credential: AppleResponse;
    if (platform === "ios") {
      if (!Capacitor.isPluginAvailable("NativeAuth"))
        throw new Error("Please update Parently to use Apple sign-in.");
      credential = await native.apple({ nonce });
    } else {
      const apple = await loadAppleJS();
      const state = randomNonce();
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nonce));
      const hashedNonce = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      // Register this exact URL with Apple and in APPLE_WEB_REDIRECT_URI.
      apple.auth.init({
        clientId: "com.parentlybabytracking.app.web.direct",
        scope: "name email",
        redirectURI: `${window.location.origin}/auth-callback`,
        state,
        nonce: hashedNonce,
        usePopup: true,
      });
      const response = await apple.auth.signIn();
      if (response.authorization.state !== state)
        throw new Error("Apple sign-in response did not match this request.");
      credential = {
        identityToken: response.authorization.id_token,
        authorizationCode: response.authorization.code,
        fullName: [response.user?.name?.firstName, response.user?.name?.lastName]
          .filter(Boolean)
          .join(" "),
      };
    }
    const { data, error } = await pendingAuth.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
      nonce,
    });
    if (error || !data.session)
      throw new Error("Apple sign-in could not be completed. Please retry or sign in with email.");
    await retainAppleAuthorization({
      data: {
        accessToken: data.session.access_token,
        code: credential.authorizationCode,
        idToken: credential.identityToken,
        nonce,
        platform,
      },
    });
    const installed = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (installed.error || !installed.data.session)
      throw new Error("Your Apple session could not be saved. Please sign in again.");
    if (credential.fullName)
      await supabase.auth
        .updateUser({ data: { full_name: credential.fullName } })
        .catch(() => undefined);
  } catch (error) {
    await pendingAuth?.auth.signOut({ scope: "local" }).catch(() => undefined);
    throw error instanceof Error
      ? error
      : new Error("Apple sign-in was cancelled or could not be completed.");
  } finally {
    signingIn = false;
  }
}
