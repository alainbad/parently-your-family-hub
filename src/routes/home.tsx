import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Droplet,
  HeartPulse,
  Moon,
  Salad,
  Sparkles,
} from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { PREGNANCY_PHOTO } from "@/lib/theme";

export const Route = createFileRoute("/home")({
  component: HomeScreen,
});

const QUICK_ACTIONS = [
  { label: "Symptom", sub: "Log how you feel", Icon: HeartPulse, tone: "primary" as const },
  { label: "Water", sub: "1.2L today", Icon: Droplet, tone: "accent" as const },
  { label: "Meal", sub: "Track nutrition", Icon: Salad, tone: "primary" as const },
  { label: "Sleep", sub: "Last: 7h 30m", Icon: Moon, tone: "accent" as const },
];

function HomeScreen() {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Welcome back"
        title="Hi, Sara"
        subtitle="Wednesday, July 15"
        right={
          <button
            aria-label="Notifications"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-ink-soft shadow-soft"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        }
      />

      <div className="px-6">
        {/* Hero photo card */}
        <section className="relative overflow-hidden rounded-[2rem] shadow-lift">
          <img
            src={PREGNANCY_PHOTO}
            alt="Warm pregnancy moment"
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
              Her hearing is developing this week.
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
            <button className="text-xs font-semibold text-primary">View all</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ label, sub, Icon, tone }) => (
              <button
                key={label}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-border bg-surface p-5 text-left shadow-soft transition-transform active:scale-[0.98]"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full ${
                    tone === "primary"
                      ? "bg-primary-soft text-primary"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{label}</p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{sub}</p>
                </div>
              </button>
            ))}
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
