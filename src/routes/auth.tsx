import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: AuthScreen,
});

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busyAction, setBusyAction] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const busy = busyAction !== null;

  useEffect(() => {
    if (!loading && session) navigate({ to: "/home" });
  }, [session, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction("email");
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/home` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyAction(null);
    }
  };

  const google = async () => {
    setBusyAction("google");
    setError(null);
    try {
      if (isEmbeddedPreview()) {
        await signInWithGooglePopupFallback();
        navigate({ to: "/home", replace: true });
        return;
      }

      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth-callback`,
        extraParams: { prompt: "select_account" },
      });

      if (res.redirected) return;
      if (res.error) throw res.error;

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("Google sign-in finished, but no session was saved.");

      navigate({ to: "/home", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setBusyAction(null);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background">
      <header className="safe-top grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-5 pt-5">
        <Link
          to="/"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-ink-soft shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-6 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Parently
        </p>
        <h1 className="mt-2 font-display text-[2rem] leading-[1.1] font-semibold text-ink">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Save your quick logs and pick up where you left off, on any device.
        </p>

        <button
          onClick={google}
          disabled={busy}
          className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 rounded-[1rem] border border-border bg-surface text-[14px] font-semibold text-ink shadow-soft transition-transform active:scale-[0.99]"
        >
          {busyAction === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-[1rem] border border-border bg-surface px-4 text-[14px] text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-[1rem] border border-border bg-surface px-4 text-[14px] text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none"
              placeholder="At least 8 characters"
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {busyAction === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 self-center text-[13px] font-semibold text-primary"
        >
          {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </main>
    </div>
  );
}

function isEmbeddedPreview() {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function signInWithGooglePopupFallback() {
  const authUrl = new URL("/~oauth/initiate", window.location.origin);
  authUrl.searchParams.set("provider", "google");
  authUrl.searchParams.set("redirect_uri", `${window.location.origin}/auth-callback`);
  authUrl.searchParams.set("state", createOAuthState());
  authUrl.searchParams.set("prompt", "select_account");

  const popup = window.open(authUrl.toString(), "_blank");
  if (!popup) {
    throw new Error("The Google sign-in window was blocked. Open the preview in a new tab and try again.");
  }

  const session = await waitForPopupSession(popup);
  if (!session) {
    throw new Error("Google sign-in did not finish. Close the Google tab and try again.");
  }
}

async function waitForPopupSession(popup: Window) {
  const started = Date.now();
  const timeoutMs = 120_000;

  while (Date.now() - started < timeoutMs) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) return data.session;

    if (popup.closed) {
      const closedCheck = await supabase.auth.getSession();
      if (closedCheck.error) throw closedCheck.error;
      return closedCheck.data.session;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 800));
  }

  try {
    popup.close();
  } catch {
    // Ignore: the user may have already closed it.
  }
  return null;
}

function createOAuthState() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C41.9 34.9 44 29.8 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
