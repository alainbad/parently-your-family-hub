import { createFileRoute } from "@tanstack/react-router";
import { Baby, Droplet, Moon, Pill, Thermometer, Utensils } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";

export const Route = createFileRoute("/track")({
  component: TrackScreen,
});

const LOGS = [
  { Icon: Utensils, label: "Feeding", value: "6 today", tint: "primary" as const },
  { Icon: Moon, label: "Sleep", value: "12h 40m", tint: "accent" as const },
  { Icon: Baby, label: "Diapers", value: "8 today", tint: "primary" as const },
  { Icon: Droplet, label: "Pumping", value: "120 ml", tint: "accent" as const },
  { Icon: Pill, label: "Medicine", value: "1 dose", tint: "primary" as const },
  { Icon: Thermometer, label: "Temperature", value: "36.8°C", tint: "accent" as const },
];

const TIMELINE = [
  { time: "07:12", label: "Left breast · 14 min", kind: "Feeding" },
  { time: "06:40", label: "Diaper · wet", kind: "Diaper" },
  { time: "05:05", label: "Slept 4h 30m", kind: "Sleep" },
  { time: "00:20", label: "Right breast · 18 min", kind: "Feeding" },
];

function TrackScreen() {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Track"
        title="Today's rhythm"
        subtitle="Baby Noor · 4 months"
      />

      <div className="px-6">
        <div className="grid grid-cols-2 gap-3">
          {LOGS.map(({ Icon, label, value, tint }) => (
            <button
              key={label}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[1.5rem] border border-border bg-surface p-4 text-left shadow-soft transition-transform active:scale-[0.98]"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                  tint === "primary"
                    ? "bg-primary-soft text-primary"
                    : "bg-accent-soft text-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-ink-soft">
                  {label}
                </span>
                <span className="mt-0.5 block truncate font-display text-[17px] font-semibold text-ink">
                  {value}
                </span>
              </span>
            </button>
          ))}
        </div>

        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Timeline
            </h3>
            <span className="text-xs font-semibold text-ink-soft">Today</span>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-surface p-2">
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] px-3 py-3 hover:bg-surface-muted"
              >
                <span className="font-display text-[15px] font-semibold text-ink">
                  {item.time}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {item.kind}
                  </span>
                  <span className="mt-0.5 block truncate text-[14px] text-ink">
                    {item.label}
                  </span>
                </span>
                <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-ink-soft">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
