import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Sparkles, Check, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import {
  hasAiChatEntitlement,
  identifyUser,
  isNativeApp,
  restorePurchases,
  startAiChatTrial,
} from "@/lib/purchases";

export const Route = createFileRoute("/chat")({
  component: ChatScreen,
});

const PERKS = [
  "24/7 answers about pregnancy, feeding, sleep & milestones",
  "Personalized guidance based on your baby's stage",
  "Instant symptom checks with pediatrician-reviewed sources",
  "Unlimited chats — private & secure",
];

function ChatScreen() {
  const { user } = useAuth();
  const [entitled, setEntitled] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const native = isNativeApp();

  useEffect(() => {
    if (!user) return;
    (async () => {
      await identifyUser(user.id);
      setEntitled(await hasAiChatEntitlement());
    })();
  }, [user]);

  async function handleSubscribe() {
    if (!native) {
      toast.info("In-app purchase runs inside the iOS/Android app.");
      return;
    }
    setPurchasing(true);
    const res = await startAiChatTrial();
    setPurchasing(false);
    if (res.status === "success") {
      setEntitled(res.entitled);
      toast.success("Welcome to Nurture AI!");
    } else if (res.status === "cancelled") {
      // silent
    } else if (res.status === "error") {
      toast.error(res.message);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    const res = await restorePurchases();
    setRestoring(false);
    if (res.status === "success") {
      setEntitled(res.entitled);
      toast.success(res.entitled ? "Subscription restored." : "No purchases found.");
    } else if (res.status === "error") {
      toast.error(res.message);
    } else if (res.status === "unavailable") {
      toast.info("Restore works inside the iOS/Android app.");
    }
  }

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Premium"
        title="Ask Nurture AI"
        subtitle="Your always-on parenting companion"
        right={
          <Link
            to="/home"
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft"
          >
            Close
          </Link>
        }
      />

      <div className="px-6">
        {entitled ? (
          <UnlockedPlaceholder />
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Premium feature
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
                Unlock Nurture AI
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                A calm, expert-backed voice whenever you need it — day or night.
              </p>

              <ul className="mt-5 space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-ink">Monthly</span>
                  <span className="font-display text-xl font-semibold text-ink">
                    $6.99<span className="text-xs font-medium text-ink-soft">/mo</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Cancel anytime · 7-day free trial
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={purchasing}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-float transition-transform active:scale-[0.98] disabled:opacity-70"
              >
                {purchasing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {purchasing ? "Opening App Store…" : "Start free trial"}
              </button>

              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold text-ink-soft"
              >
                {restoring ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3.5 w-3.5" />
                )}
                Restore purchase
              </button>

              {!native ? (
                <p className="mt-3 rounded-xl bg-background/60 p-3 text-center text-[11px] text-muted-foreground">
                  Preview mode — purchases run inside the iOS/Android app build.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function UnlockedPlaceholder() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Unlocked
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
        Nurture AI is ready
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Chat interface coming next — subscription is active.
      </p>
    </div>
  );
}
