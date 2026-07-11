import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, Loader2, LogIn, Sparkles } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { PREGNANCY_PHOTO, THEME_PHOTOS, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import {
  todaysLogsQuery,
  useAddQuickLog,
  type QuickLogKind,
} from "@/lib/quick-logs";
import quickSymptom from "@/assets/quick-symptom.jpg";
import quickWater from "@/assets/quick-water.jpg";
import quickMeal from "@/assets/quick-meal.jpg";
import quickSleep from "@/assets/quick-sleep.jpg";

export const Route = createFileRoute("/home")({
  component: HomeScreen,
});

const QUICK_ACTIONS: Array<{
  kind: QuickLogKind;
  label: string;
  sub: string;
  photo: string;
}> = [
  { kind: "symptom", label: "Symptom", sub: "Log how you feel", photo: quickSymptom },
  { kind: "water", label: "Water", sub: "Tap to add a glass", photo: quickWater },
  { kind: "meal", label: "Meal", sub: "Track nutrition", photo: quickMeal },
  { kind: "sleep", label: "Sleep", sub: "Log a rest", photo: quickSleep },
];

function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const heroPhoto = theme === "neutral" ? PREGNANCY_PHOTO : THEME_PHOTOS[theme];
  const pronoun = theme === "boy" ? "His" : theme === "girl" ? "Her" : "Their";

  const logsQuery = useQuery(todaysLogsQuery(user?.id));
  const addLog = useAddQuickLog(user?.id);

  const countByKind = (kind: QuickLogKind) =>
    logsQuery.data?.filter((l) => l.kind === kind).length ?? 0;

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Welcome back"
        title={user ? `Hi, ${user.email?.split("@")[0] ?? "there"}` : "Hi there"}
        subtitle={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        right={
          user ? (
            <button
              aria-label="Notifications"
              className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-ink-soft shadow-soft"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-soft"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )
        }
      />

      <div className="px-6">
        {/* Hero photo card */}
        <section className="relative overflow-hidden rounded-[2rem] shadow-lift">
          <img
            src={heroPhoto}
            alt="Warm parenting moment"
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-90">
              <Sparkles className="h-3.5 w-3.5" />
              Week 24
            </div>
            <h2 className="mt-2 font-display text-[28px] leading-[1.05] font-semibold">
              Baby is the size of an ear of corn.
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">
              {pronoun} hearing is developing this week.
            </p>
          </div>

          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            On track
          </div>
        </section>

        {/* Bento quick actions */}
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Quick log
            </h3>
            <span className="text-xs font-semibold text-ink-soft">
              {user
                ? `${logsQuery.data?.length ?? 0} today`
                : "Sign in to save"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ kind, label, sub, photo }) => {
              const count = countByKind(kind);
              const pending =
                addLog.isPending && addLog.variables?.kind === kind;
              const content = (
                <>
                  <div className="relative overflow-hidden rounded-[1.1rem]">
                    <img
                      src={photo}
                      alt={label}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="aspect-square w-full object-cover"
                    />
                    {count > 0 ? (
                      <span className="absolute right-2 top-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-[11px] font-bold text-primary-foreground shadow-soft">
                        {count}
                      </span>
                    ) : null}
                    {pending ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/20">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 px-2 pb-1">
                    <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
                      {label}
                      {count > 0 ? (
                        <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-soft">
                      {count > 0
                        ? `${count} logged today`
                        : sub}
                    </p>
                  </div>
                </>
              );

              const baseClass =
                "flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-border bg-surface p-3 text-left shadow-soft transition-transform active:scale-[0.98] disabled:opacity-70";

              if (!user) {
                return (
                  <Link key={kind} to="/auth" className={baseClass}>
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={kind}
                  disabled={addLog.isPending}
                  onClick={() => addLog.mutate({ kind })}
                  className={baseClass}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tip card */}
        <section className="mt-6">
          <div className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Today for you
            </p>
            <p className="mt-2 font-display text-[16px] font-semibold leading-snug text-ink">
              A 20-minute walk after lunch
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Gentle movement helps with circulation and back tension this week.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
