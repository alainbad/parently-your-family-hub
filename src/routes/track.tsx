import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Loader2,
  Pill,
  Plus,
  Ruler,
  Syringe,
} from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { AffiliateSection } from "@/components/AffiliateCard";
import { TRACK_PICKS } from "@/lib/affiliate-picks";
import { useAuth } from "@/lib/auth";
import {
  BABY_LOG_LABELS,
  todaysBabyLogsQuery,
  useAddBabyLog,
  useDeleteBabyLog,
  type BabyLogKind,
} from "@/lib/baby-logs";
import { getErrorMessage } from "@/lib/errors";
import { growthMeasurementsQuery } from "@/lib/growth";
import { QUICK_LOG_LABELS, todaysLogsQuery, useDeleteQuickLog } from "@/lib/quick-logs";
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

const BABY_LOG_TILES: { kind: BabyLogKind; label: string; sub: string; photo: string }[] = [
  { kind: "feeding", label: "Feeding", sub: "Log a feed", photo: trackFeeding },
  { kind: "sleep", label: "Sleep", sub: "Log a rest", photo: trackSleep },
  { kind: "diaper", label: "Diapers", sub: "Log a change", photo: trackDiapers },
  { kind: "pumping", label: "Pumping", sub: "Log a session", photo: trackPumping },
  { kind: "medicine", label: "Medicine", sub: "Log a dose", photo: trackMedicine },
  { kind: "temperature", label: "Temperature", sub: "Log a reading", photo: trackTemperature },
];

function TrackScreen() {
  const { user } = useAuth();
  const babyLogsQuery = useQuery(todaysBabyLogsQuery(user?.id));
  const addBabyLog = useAddBabyLog(user?.id);

  const countByKind = (kind: BabyLogKind) =>
    babyLogsQuery.data?.filter((l) => l.kind === kind).length ?? 0;

  return (
    <AppShell>
      <ScreenHeader eyebrow="Track" title="Today's rhythm" subtitle="Baby Noor · 4 months" />

      <div className="px-6">
        <div className="grid grid-cols-2 gap-3">
          {BABY_LOG_TILES.map(({ kind, label, sub, photo }) => {
            const count = countByKind(kind);
            const pending = addBabyLog.isPending && addBabyLog.variables?.kind === kind;
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
                  <p className="text-[12px] font-semibold text-ink-soft">{label}</p>
                  <p className="mt-0.5 truncate font-display text-[17px] font-semibold text-ink">
                    {count > 0 ? `${count} today` : sub}
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
                disabled={addBabyLog.isPending}
                onClick={() =>
                  addBabyLog.mutate(
                    { kind },
                    {
                      onError: (err) =>
                        toast.error(getErrorMessage(err, "Could not save that log")),
                    },
                  )
                }
                className={baseClass}
              >
                {content}
              </button>
            );
          })}
        </div>

        <TimelineSection userId={user?.id} />

        <RemindersSection userId={user?.id} />

        <GrowthSummaryCard userId={user?.id} />

        <AffiliateSection title="Gear that helps you track" picks={TRACK_PICKS} surface="track" />
      </div>
    </AppShell>
  );
}

type TimelineEntry = {
  id: string;
  created_at: string;
  kindLabel: string;
  description: string;
  source: "quick" | "baby";
};

function TimelineSection({ userId }: { userId: string | undefined }) {
  const logsQuery = useQuery(todaysLogsQuery(userId));
  const babyLogsQuery = useQuery(todaysBabyLogsQuery(userId));
  const deleteLog = useDeleteQuickLog(userId);
  const deleteBabyLog = useDeleteBabyLog(userId);

  const entries = useMemo<TimelineEntry[]>(() => {
    const quick = (logsQuery.data ?? []).map((log) => ({
      id: log.id,
      created_at: log.created_at,
      kindLabel: log.kind,
      description: log.value ?? QUICK_LOG_LABELS[log.kind],
      source: "quick" as const,
    }));
    const baby = (babyLogsQuery.data ?? []).map((log) => ({
      id: log.id,
      created_at: log.created_at,
      kindLabel: log.kind,
      description: log.value ?? BABY_LOG_LABELS[log.kind],
      source: "baby" as const,
    }));
    return [...quick, ...baby].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [logsQuery.data, babyLogsQuery.data]);

  const isLoading = logsQuery.isLoading || babyLogsQuery.isLoading;

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-[17px] font-semibold text-ink">Timeline</h3>
        <span className="text-xs font-semibold text-ink-soft">Today</span>
      </div>

      {!userId ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-center text-sm text-ink-soft">
          <Link to="/auth" className="font-semibold text-primary">
            Sign in
          </Link>{" "}
          to see everything you've logged today, in one place.
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-center text-sm text-ink-soft">
          Nothing logged yet today — tap a tile above or on Home to add one.
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-border bg-surface p-2">
          {entries.map((entry) => (
            <div
              key={`${entry.source}-${entry.id}`}
              className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] px-3 py-3 hover:bg-surface-muted"
            >
              <span className="font-display text-[15px] font-semibold text-ink">
                {format(new Date(entry.created_at), "HH:mm")}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {entry.kindLabel}
                </span>
                <span className="mt-0.5 block truncate text-[14px] text-ink">
                  {entry.description}
                </span>
              </span>
              <button
                type="button"
                disabled={deleteLog.isPending || deleteBabyLog.isPending}
                onClick={() => {
                  const onError = (err: unknown) =>
                    toast.error(getErrorMessage(err, "Could not delete that entry"));
                  if (entry.source === "quick") {
                    deleteLog.mutate(entry.id, { onError });
                  } else {
                    deleteBabyLog.mutate(entry.id, { onError });
                  }
                }}
                className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-ink-soft disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
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

function GrowthSummaryCard({ userId }: { userId: string | undefined }) {
  const measurements = useQuery(growthMeasurementsQuery(userId));
  const latest = measurements.data?.at(-1);

  return (
    <section className="mt-7">
      <h3 className="mb-3 font-display text-[17px] font-semibold text-ink">Growth</h3>

      {!userId ? (
        <Link
          to="/auth"
          className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-sm text-ink-soft"
        >
          <span>
            <span className="font-semibold text-primary">Sign in</span> to log weight, height, and
            head circumference.
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : (
        <Link
          to="/growth"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft transition-transform active:scale-[0.99]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Ruler className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            {latest ? (
              <>
                <span className="block text-[14px] font-semibold text-ink">
                  {latest.weight_kg != null ? `${latest.weight_kg} kg` : null}
                  {latest.weight_kg != null && latest.height_cm != null ? " · " : null}
                  {latest.height_cm != null ? `${latest.height_cm} cm` : null}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-soft">
                  Last logged {format(new Date(latest.measured_at), "MMM d, yyyy")}
                </span>
              </>
            ) : (
              <span className="block text-[13px] text-ink-soft">
                Log your first measurement to start a chart.
              </span>
            )}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" />
        </Link>
      )}
    </section>
  );
}
