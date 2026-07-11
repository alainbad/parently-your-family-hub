import { createFileRoute } from "@tanstack/react-router";
import { Check, Circle, Sparkles } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";

export const Route = createFileRoute("/journey")({
  component: JourneyScreen,
});

const MILESTONES = [
  { week: "Week 20", title: "Anatomy scan", body: "Detailed ultrasound with your doctor.", state: "done" as const },
  { week: "Week 24", title: "You are here", body: "Baby's hearing sharpens. Time to plan childbirth classes.", state: "current" as const },
  { week: "Week 28", title: "Glucose test", body: "Screening for gestational diabetes.", state: "upcoming" as const },
  { week: "Week 32", title: "Hospital bag", body: "Start packing essentials for you and baby.", state: "upcoming" as const },
  { week: "Week 36", title: "Birth plan review", body: "Finalize your preferences with your care team.", state: "upcoming" as const },
];

function JourneyScreen() {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Journey"
        title="Your path to meeting baby"
        subtitle="16 weeks to go"
      />

      <div className="px-6">
        <div className="rounded-[1.75rem] bg-gradient-warm p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Third trimester begins
          </div>
          <p className="mt-2 font-display text-[18px] leading-snug text-ink">
            You're 60% of the way there. Small steps now make room for big
            moments soon.
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div className="h-full w-[60%] rounded-full bg-primary" />
          </div>
        </div>

        <section className="mt-7">
          <ol className="relative flex flex-col gap-4 pl-2">
            <span className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
            {MILESTONES.map((m) => (
              <li
                key={m.title}
                className="relative grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3"
              >
                <span
                  className={`z-10 grid h-10 w-10 place-items-center rounded-full border-2 ${
                    m.state === "done"
                      ? "border-primary bg-primary text-primary-foreground"
                      : m.state === "current"
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-surface text-ink-soft"
                  }`}
                >
                  {m.state === "done" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3" fill="currentColor" />
                  )}
                </span>
                <div
                  className={`min-w-0 rounded-[1.5rem] border p-4 ${
                    m.state === "current"
                      ? "border-accent/40 bg-accent-soft/50"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {m.week}
                  </div>
                  <div className="mt-1 font-display text-[16px] font-semibold text-ink">
                    {m.title}
                  </div>
                  <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {m.body}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
