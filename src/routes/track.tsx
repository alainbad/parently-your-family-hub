import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Calendar, Check, Loader2, Pill, Plus, Syringe } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { AffiliateSection } from "@/components/AffiliateCard";
import { TRACK_PICKS } from "@/lib/affiliate-picks";
import { useAuth } from "@/lib/auth";
import {
  upcomingRemindersQuery,
  useAddReminder,
  useCompleteReminder,
  type ReminderKind,
} from "@/lib/reminders";
import trackFeeding from "@/assets/track-feeding.jpg";
import trackSleep from "@/assets/track-sleep.jpg";
import trackDiapers from "@/assets/track-diapers.jpg";
import trackPumping from "@/assets/track-pumping.jpg";
import trackMedicine from "@/assets/track-medicine.jpg";
import trackTemperature from "@/assets/track-temperature.jpg";

export const Route = createFileRoute("/track")({
  component: TrackScreen,
});

const REMINDER_KINDS: { value: ReminderKind; label: string; Icon: typeof Bell }[] = [
  { value: "appointment", label: "Appointment", Icon: Calendar },
  { value: "vaccine", label: "Vaccine", Icon: Syringe },
  { value: "medicine", label: "Medicine", Icon: Pill },
  { value: "other", label: "Other", Icon: Bell },
];

function reminderIcon(kind: ReminderKind) {
  return REMINDER_KINDS.find((k) => k.value === kind)?.Icon ?? Bell;
}

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
  const { user } = useAuth();

  return (
    <AppShell>
      <ScreenHeader eyebrow="Track" title="Today's rhythm" subtitle="Baby Noor · 4 months" />

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
                <p className="text-[12px] font-semibold text-ink-soft">{label}</p>
                <p className="mt-0.5 truncate font-display text-[17px] font-semibold text-ink">
                  {value}
                </p>
              </div>
            </button>
          ))}
        </div>

        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">Timeline</h3>
            <span className="text-xs font-semibold text-ink-soft">Today</span>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-surface p-2">
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] px-3 py-3 hover:bg-surface-muted"
              >
                <span className="font-display text-[15px] font-semibold text-ink">{item.time}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {item.kind}
                  </span>
                  <span className="mt-0.5 block truncate text-[14px] text-ink">{item.label}</span>
                </span>
                <button className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-ink-soft">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>

        <RemindersSection userId={user?.id} />

        <AffiliateSection title="Gear that helps you track" picks={TRACK_PICKS} surface="track" />
      </div>
    </AppShell>
  );
}

function RemindersSection({ userId }: { userId: string | undefined }) {
  const [adding, setAdding] = useState(false);
  const reminders = useQuery(upcomingRemindersQuery(userId));
  const complete = useCompleteReminder(userId);

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-[17px] font-semibold text-ink">Reminders</h3>
        {userId ? (
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            {adding ? "Close" : "Add"}
          </button>
        ) : null}
      </div>

      {!userId ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-center text-sm text-ink-soft">
          <Link to="/auth" className="font-semibold text-primary">
            Sign in
          </Link>{" "}
          to set appointment, vaccine, and medicine reminders.
        </div>
      ) : (
        <>
          {adding ? <AddReminderForm userId={userId} onDone={() => setAdding(false)} /> : null}

          {reminders.isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
            </div>
          ) : reminders.data?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-center text-sm text-ink-soft">
              Nothing coming up. Add a reminder to stay ahead of appointments.
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-border bg-surface p-2">
              {reminders.data?.map((r) => {
                const Icon = reminderIcon(r.kind);
                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] px-3 py-3 hover:bg-surface-muted"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {r.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-soft">
                        {formatDistanceToNow(new Date(r.due_at), { addSuffix: true })}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label="Mark done"
                      disabled={complete.isPending}
                      onClick={() => complete.mutate(r.id)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-border text-ink-soft hover:bg-background disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function AddReminderForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ReminderKind>("appointment");
  const [dueAt, setDueAt] = useState("");
  const add = useAddReminder(userId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueAt) return;
    await add.mutateAsync({
      title: title.trim(),
      kind,
      due_at: new Date(dueAt).toISOString(),
    });
    setTitle("");
    setDueAt("");
    onDone();
  };

  return (
    <form
      onSubmit={submit}
      className="mb-3 flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 shadow-soft"
    >
      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. 4-month checkup"
        className="h-11 rounded-xl border border-border bg-surface-alt px-3 text-[14px] text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none"
      />
      <div className="flex gap-2.5">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ReminderKind)}
          className="h-11 flex-1 rounded-xl border border-border bg-surface-alt px-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        >
          {REMINDER_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          required
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-border bg-surface-alt px-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={add.isPending}
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
      >
        {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save reminder
      </button>
    </form>
  );
}
