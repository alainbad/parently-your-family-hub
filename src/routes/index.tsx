import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Welcome,
});

function Welcome() {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-gradient-hero overflow-hidden">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary-soft opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 rounded-full bg-accent-soft opacity-70 blur-3xl" />

      <header className="safe-top relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Heart className="h-4 w-4" fill="currentColor" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Parently
          </span>
        </div>
        <Link
          to="/home"
          className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Skip
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-6">
        <div className="mb-10 flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Pregnancy through age 5</span>
        </div>

        <h1 className="font-display text-[2.75rem] leading-[1.05] font-medium tracking-tight text-ink">
          Your family's{" "}
          <span className="italic text-accent">parenting</span> companion.
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
          Gentle guidance, thoughtful tracking, and shared care — designed for
          both parents from the very first week.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            to="/onboarding"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
          >
            Begin your journey
          </Link>
          <Link
            to="/home"
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-border bg-surface/60 text-base font-medium text-ink backdrop-blur transition-colors active:bg-surface"
          >
            I already have an account
          </Link>
        </div>

        <p className="safe-bottom mt-6 text-center text-xs text-ink-soft">
          By continuing you agree to our care & privacy principles.
        </p>
      </main>
    </div>
  );
}
