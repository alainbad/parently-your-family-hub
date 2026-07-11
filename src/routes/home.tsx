import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  Droplet,
  Footprints,
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
  { label: "Symptom", Icon: HeartPulse, tone: "primary" as const },
  { label: "Water", Icon: Droplet, tone: "accent" as const },
  { label: "Meal", Icon: Salad, tone: "primary" as const },
  { label: "Sleep", Icon: Moon, tone: "accent" as const },
];




function HomeScreen() {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Good morning"
        title="Hi, Sara"
        subtitle="Wednesday, July 15"
        right={
          <button
            aria-label="Notifications"
            className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-ink-soft"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
          </button>
        }
      />

      <div className="px-6">
        {/* Weekly hero — real photo with soft gradient overlay */}
        <section className="relative overflow-hidden rounded-4xl shadow-lift">
          <img
            src={PREGNANCY_PHOTO}
            alt="Warm pregnancy moment"
            className="h-64 w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-90">
              <Sparkles className="h-3.5 w-3.5" />
              Week 24
            </div>
            <h2 className="mt-2 font-display text-[24px] leading-tight font-medium">
              Baby is the size of an ear of corn.
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">
              Her hearing is developing this week — soft voices feel familiar.
            </p>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Weeks" value="24" />
          <Stat label="Weight" value="600g" />
          <Stat label="Length" value="30cm" />
        </div>


        {/* Quick actions */}
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Quick log
            </h3>
            <button className="text-xs font-medium text-primary">
              View all
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ label, Icon, tone }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-surface p-3 transition-transform active:scale-95"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${
                    tone === "primary"
                      ? "bg-primary-soft text-primary"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11.5px] font-medium text-ink">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Today card */}
        <section className="mt-6">
          <h3 className="mb-3 font-display text-[17px] font-semibold text-ink">
            Today for you
          </h3>
          <div className="flex flex-col gap-3">
            <TodayCard
              Icon={Footprints}
              tint="primary"
              title="A 20-minute walk"
              body="Gentle movement helps with circulation and back tension this week."
              meta="Suggested"
            />
            <TodayCard
              Icon={Salad}
              tint="accent"
              title="Add leafy greens to lunch"
              body="Extra folate and iron support baby's rapid growth this trimester."
              meta="Nutrition"
            />
          </div>
        </section>

        {/* AI assistant */}
        <section className="mt-6">
          <button className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-surface p-4 text-left shadow-soft transition-transform active:scale-[0.99]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-background">
              <Brain className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[16px] font-semibold text-ink">
                Ask the Parently assistant
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
                "Is it safe to sleep on my back at 24 weeks?"
              </span>
            </span>
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
              New
            </span>
          </button>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur">
      <div className="font-display text-lg font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-80">
        {label}
      </div>
    </div>
  );
}

function TodayCard({
  Icon,
  tint,
  title,
  body,
  meta,
}: {
  Icon: typeof Footprints;
  tint: "primary" | "accent";
  title: string;
  body: string;
  meta: string;
}) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-3xl border border-border bg-surface p-4">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
          tint === "primary"
            ? "bg-primary-soft text-primary"
            : "bg-accent-soft text-accent"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {meta}
          </span>
        </div>
        <h4 className="mt-1 font-display text-[16px] font-semibold text-ink">
          {title}
        </h4>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </article>
  );
}
