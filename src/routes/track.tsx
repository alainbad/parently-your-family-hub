import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import trackFeeding from "@/assets/track-feeding.jpg";
import trackSleep from "@/assets/track-sleep.jpg";
import trackDiapers from "@/assets/track-diapers.jpg";
import trackPumping from "@/assets/track-pumping.jpg";
import trackMedicine from "@/assets/track-medicine.jpg";
import trackTemperature from "@/assets/track-temperature.jpg";

export const Route = createFileRoute("/track")({
  component: TrackScreen,
});

const LOGS = [
  { photo: trackFeeding, label: "Feeding", value: "6 today" },
  { photo: trackSleep, label: "Sleep", value: "12h 40m" },
  { photo: trackDiapers, label: "Diapers", value: "8 today" },
  { photo: trackPumping, label: "Pumping", value: "120 ml" },
  { photo: trackMedicine, label: "Medicine", value: "1 dose" },
  { photo: trackTemperature, label: "Temperature", value: "36.8°C" },
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
          {LOGS.map(({ photo, label, value }) => (
            <button
              key={label}
              className="flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border border-border bg-surface p-3 text-left shadow-soft transition-transform active:scale-[0.98]"
            >
              <div className="overflow-hidden rounded-[1.1rem]">
                <img
                  src={photo}
                  alt={label}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="min-w-0 px-2 pb-1">
                <p className="text-[12px] font-semibold text-ink-soft">
                  {label}
                </p>
                <p className="mt-0.5 truncate font-display text-[17px] font-semibold text-ink">
                  {value}
                </p>
              </div>
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
