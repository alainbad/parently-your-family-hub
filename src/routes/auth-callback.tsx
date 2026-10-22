import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth-callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — Parently" },
      { name: "description", content: "Completing sign-in to Parently." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { session, isReady, authError } = useAuth();
  const error = isReady
    ? (authError ?? (!session ? "Sign-in completed, but the session could not be restored." : null))
    : null;

  // AuthProvider owns the exchange. A second exchange here would consume a
  // one-use PKCE code twice and race the root session initialization.
  useEffect(() => {
    if (isReady && session && !authError) void navigate({ to: "/", replace: true });
  }, [isReady, session, authError, navigate]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-6 text-center">
      <div>
        {error ? (
          <>
            <p className="font-display text-xl font-semibold text-ink">Sign-in needs another try</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{error}</p>
            <button
              type="button"
              onClick={() => navigate({ to: "/auth", replace: true })}
              className="mt-5 inline-flex h-12 items-center justify-center rounded-[1rem] bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-4 font-display text-xl font-semibold text-ink">Signing you in</p>
          </>
        )}
      </div>
    </main>
  );
}
