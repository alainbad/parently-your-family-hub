import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth-callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finishSignIn() {
      const urlError = new URLSearchParams(window.location.hash.slice(1)).get(
        "error_description",
      );
      if (urlError) {
        setError(urlError);
        return;
      }

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        if (data.session) {
          navigate({ to: "/home", replace: true });
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }

      if (!cancelled) {
        setError("Google sign-in completed, but the session could not be restored.");
      }
    }

    finishSignIn();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

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