import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Baby, HeartPulse, Sprout, Sun, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const STAGES = [
  {
    id: "pregnancy",
    label: "Pregnant",
    hint: "Week by week guidance for you and baby",
    Icon: HeartPulse,
  },
  {
    id: "newborn",
    label: "Newborn (0–3 months)",
    hint: "Feeding, sleep, and gentle recovery",
    Icon: Sprout,
  },
  {
    id: "baby",
    label: "Baby (3–12 months)",
    hint: "Milestones, growth, and first foods",
    Icon: Baby,
  },
  {
    id: "toddler",
    label: "Toddler (1–3 years)",
    hint: "Play, language, and daily rhythms",
    Icon: Sun,
  },
  {
    id: "preschool",
    label: "Preschool (3–5 years)",
    hint: "Learning, emotions, and routines",
    Icon: Users,
  },
] as const;

function Onboarding() {
  const [selected, setSelected] = useState<string>("pregnancy");
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background">
      <header className="safe-top grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-5">
        <Link
          to="/"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-ink-soft transition-colors active:bg-surface-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-1.5 justify-self-center">
          <span className="h-1.5 w-6 rounded-full bg-primary" />
          <span className="h-1.5 w-6 rounded-full bg-border" />
          <span className="h-1.5 w-6 rounded-full bg-border" />
        </div>
        <span className="text-sm font-medium text-ink-soft">1 / 3</span>
      </header>

      <main className="flex flex-1 flex-col px-6 pt-8">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Let's begin
        </p>
        <h1 className="mt-2 font-display text-[2rem] leading-[1.1] font-medium text-ink">
          Where are you in your family journey?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          We'll shape Parently around your stage. You can change this any time.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          {STAGES.map(({ id, label, hint, Icon }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border p-4 text-left transition-all active:scale-[0.99] ${
                  active
                    ? "border-primary/40 bg-primary-soft/60 shadow-soft"
                    : "border-border bg-surface"
                }`}
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-muted text-ink-soft"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[17px] font-semibold text-ink">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
                    {hint}
                  </span>
                </span>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    active
                      ? "border-primary bg-primary"
                      : "border-border bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </main>

      <footer className="safe-bottom sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-4">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
