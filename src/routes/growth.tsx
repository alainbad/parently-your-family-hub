import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Plus, Ruler } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { growthMeasurementsQuery, useAddMeasurement } from "@/lib/growth";

export const Route = createFileRoute("/growth")({
  component: GrowthScreen,
});

type Metric = "weight_kg" | "height_cm" | "head_circumference_cm";

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: "weight_kg", label: "Weight", unit: "kg" },
  { value: "height_cm", label: "Height", unit: "cm" },
  { value: "head_circumference_cm", label: "Head", unit: "cm" },
];

function GrowthScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AppShell>
        <ScreenHeader eyebrow="Growth" title="Sign in required" />
        <div className="px-6">
          <Link
            to="/auth"
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-soft"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return <GrowthContent userId={user.id} />;
}

function GrowthContent({ userId }: { userId: string }) {
  const [metric, setMetric] = useState<Metric>("weight_kg");
  const [adding, setAdding] = useState(false);
  const measurements = useQuery(growthMeasurementsQuery(userId));

  const chartData = useMemo(
    () =>
      (measurements.data ?? [])
        .filter((m) => m[metric] != null)
        .map((m) => ({
          date: format(new Date(m.measured_at), "MMM d"),
          value: m[metric] as number,
        })),
    [measurements.data, metric],
  );

  const activeMetric = METRICS.find((m) => m.value === metric)!;

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Track"
        title="Growth"
        subtitle="Weight, height, and head circumference over time"
        right={
          <Link
            to="/track"
            aria-label="Back"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-ink-soft shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
      />

      <div className="px-6">
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMetric(m.value)}
              className={`flex-1 rounded-full border px-3 py-2 text-[12px] font-semibold transition-colors ${
                metric === m.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-ink-soft"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-[1.75rem] border border-border bg-surface p-4 shadow-soft">
          {measurements.isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-sm text-ink-soft">
              <Ruler className="h-6 w-6 text-primary" />
              No {activeMetric.label.toLowerCase()} measurements logged yet.
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    unit={activeMetric.unit}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} ${activeMetric.unit}`,
                      activeMetric.label,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <h3 className="font-display text-[17px] font-semibold text-ink">History</h3>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            {adding ? "Close" : "Add"}
          </button>
        </div>

        {adding ? <AddMeasurementForm userId={userId} onDone={() => setAdding(false)} /> : null}

        {measurements.data?.length ? (
          <div className="mt-3 rounded-[1.75rem] border border-border bg-surface p-2">
            {[...measurements.data].reverse().map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 rounded-[1.25rem] px-3 py-3"
              >
                <span className="font-display text-[14px] font-semibold text-ink">
                  {format(new Date(m.measured_at), "MMM d, yyyy")}
                </span>
                <span className="flex flex-wrap gap-x-3 text-[12px] text-ink-soft">
                  {m.weight_kg != null ? <span>{m.weight_kg} kg</span> : null}
                  {m.height_cm != null ? <span>{m.height_cm} cm</span> : null}
                  {m.head_circumference_cm != null ? (
                    <span>head {m.head_circumference_cm} cm</span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function AddMeasurementForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [error, setError] = useState<string | null>(null);
  const add = useAddMeasurement(userId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!weight && !height && !head) {
      setError("Enter at least one measurement.");
      return;
    }
    await add.mutateAsync({
      measured_at: date,
      weight_kg: weight ? Number(weight) : null,
      height_cm: height ? Number(height) : null,
      head_circumference_cm: head ? Number(head) : null,
    });
    setWeight("");
    setHeight("");
    setHead("");
    onDone();
  };

  return (
    <form
      onSubmit={submit}
      className="mt-3 flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-4 shadow-soft"
    >
      <input
        type="date"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-11 rounded-xl border border-border bg-surface-alt px-3 text-[14px] text-ink focus:border-primary focus:outline-none"
      />
      <div className="flex gap-2.5">
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
          className="h-11 flex-1 rounded-xl border border-border bg-surface-alt px-3 text-[13px] text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Height (cm)"
          className="h-11 flex-1 rounded-xl border border-border bg-surface-alt px-3 text-[13px] text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none"
        />
      </div>
      <input
        type="number"
        step="0.01"
        inputMode="decimal"
        value={head}
        onChange={(e) => setHead(e.target.value)}
        placeholder="Head circumference (cm)"
        className="h-11 rounded-xl border border-border bg-surface-alt px-3 text-[13px] text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none"
      />
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={add.isPending}
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
      >
        {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save measurement
      </button>
    </form>
  );
}
