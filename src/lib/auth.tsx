import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { restoreOAuthSessionFromUrl } from "@/lib/auth-redirect";
import { observeAppleRevocation } from "@/lib/native-auth";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isReady: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let removeListener: (() => void) | undefined;
    void observeAppleRevocation(() => {
      if (!active) return;
      setSession(null);
      void queryClient.cancelQueries().then(() => queryClient.clear());
      void supabase.auth.signOut({ scope: "local" });
    })
      .then((remove) => {
        if (active) removeListener = remove;
        else remove();
      })
      .catch(() => {
        /* Older native builds do not support the listener. */
      });
    return () => {
      active = false;
      removeListener?.();
    };
  }, [queryClient]);

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      try {
        const restored = await restoreOAuthSessionFromUrl();
        if (!mounted) return;

        setAuthError(restored.error);

        if (restored.session) {
          setSession(restored.session);
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!mounted) return;
          setSession(data.session);
        }
      } catch {
        if (!mounted) return;
        setSession(null);
        setAuthError("Your session could not be restored. Please sign in again.");
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession) setAuthError(null);
    });
    const unsubscribe = () => sub.subscription.unsubscribe();

    void hydrateSession();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading: !isReady,
    isReady,
    authError,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await queryClient.cancelQueries();
      queryClient.clear();
      setSession(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthReady() {
  return useAuth();
}
