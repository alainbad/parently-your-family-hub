import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { AffiliateSection, type AffiliatePick } from "@/components/AffiliateCard";
import { JOURNEY_PICKS_BY_WEEK } from "@/lib/affiliate-picks";
import { useAuth } from "@/lib/auth";
import { profileQuery } from "@/lib/profile";
import {
  ageInWeeks,
  pregnancyWeek,
  resolveStageAnswers,
  STAGE_MILESTONES,
  useLocalStageAnswers,
  type Stage,
} from "@/lib/baby-stage";
import {
  milestoneRecordsQuery,
  useMarkMilestoneAchieved,
  useUnmarkMilestone,
  type MilestoneRecord,
} from "@/lib/milestone-records";
import { getErrorMessage } from "@/lib/errors";
import journeyScan from "@/assets/journey-scan.jpg";
import journeyCurrent from "@/assets/journey-current.jpg";
import journeyGlucose from "@/assets/journey-glucose.jpg";
import journeyBag from "@/assets/journey-bag.jpg";
import journeyBirthPlan from "@/assets/journey-birthplan.jpg";
import stageNewborn from "@/assets/stage-newborn.jpg";
import stageBaby from "@/assets/stage-baby.jpg";
import stageToddler from "@/assets/stage-toddler.jpg";
import stagePreschool from "@/assets/stage-preschool.jpg";

export const Route = createFileRoute("/journey")({
  component: JourneyScreen,
});

type MilestoneState = "done" | "current" | "upcoming";

type Milestone = {
  /** Stable key used to store achievement records — never rename once shipped. */
  id: string;
  atWeek: number;
  label: string;
  title: string;
  body: string;
  photo: string;
  picks?: AffiliatePick[];
};

const PREGNANCY_MILESTONES: Milestone[] = [
  {
    id: "pregnancy-anatomy-scan",
    atWeek: 20,
    label: "Week 20",
    title: "Anatomy scan",
    body: "Detailed ultrasound with your doctor.",
    photo: journeyScan,
  },
  {
    id: "pregnancy-hearing-classes",
    atWeek: 24,
    label: "Week 24",
    title: "Hearing & childbirth classes",
    body: "Baby's hearing sharpens. Time to plan childbirth classes.",
    photo: journeyCurrent,
    picks: JOURNEY_PICKS_BY_WEEK["Week 24"],
  },
  {
    id: "pregnancy-glucose-test",
    atWeek: 28,
    label: "Week 28",
    title: "Glucose test",
    body: "Screening for gestational diabetes.",
    photo: journeyGlucose,
    picks: JOURNEY_PICKS_BY_WEEK["Week 28"],
  },
  {
    id: "pregnancy-hospital-bag",
    atWeek: 32,
    label: "Week 32",
    title: "Hospital bag",
    body: "Start packing essentials for you and baby.",
    photo: journeyBag,
    picks: JOURNEY_PICKS_BY_WEEK["Week 32"],
  },
  {
    id: "pregnancy-birth-plan",
    atWeek: 36,
    label: "Week 36",
    title: "Birth plan review",
    body: "Finalize your preferences with your care team.",
    photo: journeyBirthPlan,
    picks: JOURNEY_PICKS_BY_WEEK["Week 36"],
  },
];

const STAGE_PHOTOS: Record<Exclude<Stage, "pregnancy">, string> = {
  newborn: stageNewborn,
  baby: stageBaby,
  toddler: stageToddler,
  preschool: stagePreschool,
};

function ageWeeksLabel(weeks: number): string {
  if (weeks < 12) return `~${weeks} wk${weeks === 1 ? "" : "s"}`;
  const months = Math.round(weeks / 4.345);
  return `~${months} mo`;
}

/** Items before the current mark are "done", the first not-yet-reached one
 * is "current", everything after is "upcoming". */
function withStates(items: { atWeek: number }[], currentWeek: number): MilestoneState[] {
  let assigned = false;
  return items.map((item) => {
    if (item.atWeek < currentWeek) return "done";
    if (!assigned) {
      assigned = true;
      return "current";
    }
    return "upcoming";
  });
}

function trimesterLabel(week: number): string {
  if (week < 14) return "First trimester";
  if (week < 28) return "Second trimester";
  return "Third trimester";
}

function JourneyScreen() {
  const { user } = useAuth();
  const profile = useQuery(profileQuery(user?.id));
  const localAnswers = useLocalStageAnswers();
  const answers = resolveStageAnswers(Boolean(user), profile.data, localAnswers);
  const records = useQuery(milestoneRecordsQuery(user?.id));

  if (answers?.stage === "pregnancy" && answers.dueDate) {
    return (
      <PregnancyJourney dueDate={answers.dueDate} userId={user?.id} records={records.data ?? []} />
    );
  }
  if (answers && answers.stage !== "pregnancy" && answers.birthDate) {
    return (
      <StageJourney
        stage={answers.stage}
        birthDate={answers.birthDate}
        userId={user?.id}
        records={records.data ?? []}
      />
    );
  }

  return (
    <AppShell>
      <ScreenHeader eyebrow="Journey" title="Your path together" />
      <div className="px-6">
        <Link
          to="/onboarding"
          className="block rounded-[1.75rem] border border-dashed border-border bg-surface/60 p-6 text-sm text-ink-soft"
        >
          <span className="font-semibold text-primary">
            Add {answers?.stage === "pregnancy" ? "your due date" : "baby's birthday"}
          </span>{" "}
          to see week-by-week milestones here.
        </Link>
      </div>
    </AppShell>
  );
}

function PregnancyJourney({
  dueDate,
  userId,
  records,
}: {
  dueDate: string;
  userId: string | undefined;
  records: MilestoneRecord[];
}) {
  const week = pregnancyWeek(dueDate);
  const percent = Math.min(100, Math.max(0, Math.round((week / 40) * 100)));
  const weeksToGo = Math.max(0, 40 - week);
  const states = withStates(PREGNANCY_MILESTONES, week);
  const achievedByKey = new Map(records.map((r) => [r.milestone_key, r]));

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Journey"
        title="Your path to meeting baby"
        subtitle={weeksToGo > 0 ? `${weeksToGo} weeks to go` : "Any day now"}
      />

      <div className="px-6">
        <div className="rounded-[1.75rem] bg-gradient-warm p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            {trimesterLabel(week)}
          </div>
          <p className="mt-2 font-display text-[18px] leading-snug text-ink">
            You're {percent}% of the way there. Small steps now make room for big moments soon.
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <section className="mt-7 flex flex-col gap-4">
          {PREGNANCY_MILESTONES.map((m, i) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              state={states[i]}
              userId={userId}
              record={achievedByKey.get(m.id)}
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function StageJourney({
  stage,
  birthDate,
  userId,
  records,
}: {
  stage: Exclude<Stage, "pregnancy">;
  birthDate: string;
  userId: string | undefined;
  records: MilestoneRecord[];
}) {
  const currentWeeks = ageInWeeks(birthDate);
  const items = STAGE_MILESTONES[stage];
  const states = withStates(items, currentWeeks);
  const photo = STAGE_PHOTOS[stage];
  const achievedByKey = new Map(records.map((r) => [r.milestone_key, r]));

  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Journey"
        title="Milestones to look forward to"
        subtitle={`${ageWeeksLabel(currentWeeks)} old`}
      />

      <div className="px-6">
        <section className="flex flex-col gap-4">
          {items.map((m, i) => (
            <MilestoneCard
              key={m.id}
              milestone={{
                id: m.id,
                atWeek: m.atWeek,
                label: ageWeeksLabel(m.atWeek),
                title: m.title,
                body: m.body,
                photo,
              }}
              state={states[i]}
              userId={userId}
              record={achievedByKey.get(m.id)}
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function MilestoneCard({
  milestone,
  state,
  userId,
  record,
}: {
  milestone: Milestone;
  state: MilestoneState;
  userId: string | undefined;
  record: MilestoneRecord | undefined;
}) {
  const markAchieved = useMarkMilestoneAchieved(userId);
  const unmark = useUnmarkMilestone(userId);
  const [formOpen, setFormOpen] = useState(false);
  const [dateValue, setDateValue] = useState(() => new Date().toISOString().slice(0, 10));
  const achieved = Boolean(record);

  return (
    <article
      className={`overflow-hidden rounded-[1.75rem] border shadow-soft ${
        achieved
          ? "border-primary/40 bg-primary/5"
          : state === "current"
            ? "border-accent/40 bg-accent-soft/40"
            : "border-border bg-surface"
      }`}
    >
      <div className="relative">
        <img
          src={milestone.photo}
          alt={milestone.title}
          loading="lazy"
          width={1024}
          height={1024}
          className={`aspect-[16/9] w-full object-cover ${state === "upcoming" && !achieved ? "opacity-70" : ""}`}
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur ${
            achieved
              ? "bg-primary/90 text-primary-foreground"
              : state === "done"
                ? "bg-primary/90 text-primary-foreground"
                : state === "current"
                  ? "bg-accent/90 text-accent-foreground"
                  : "bg-white/80 text-ink-soft"
          }`}
        >
          {achieved
            ? "Achieved"
            : state === "done"
              ? "Done"
              : state === "current"
                ? "Now"
                : "Upcoming"}
        </span>
      </div>
      <div className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {milestone.label}
        </div>
        <div className="mt-1 font-display text-[17px] font-semibold text-ink">
          {milestone.title}
        </div>
        <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">{milestone.body}</div>

        {userId ? (
          <div className="mt-3">
            {achieved && record ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  Achieved {format(record.achieved_at)}
                </span>
                <button
                  type="button"
                  aria-label="Remove this achievement"
                  disabled={unmark.isPending}
                  onClick={() =>
                    unmark.mutate(milestone.id, {
                      onError: (err) =>
                        toast.error(getErrorMessage(err, "Could not remove that record")),
                    })
                  }
                  className="grid h-7 w-7 place-items-center rounded-full border border-border text-ink-soft hover:bg-background disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setFormOpen((v) => !v)}
                  className="rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-ink-soft"
                >
                  {formOpen ? "Close" : "Mark achieved"}
                </button>
                {formOpen ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      markAchieved.mutate(
                        { milestoneKey: milestone.id, achievedAt: dateValue },
                        {
                          onSuccess: () => setFormOpen(false),
                          onError: (err) =>
                            toast.error(getErrorMessage(err, "Could not save that milestone")),
                        },
                      );
                    }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <input
                      type="date"
                      required
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-border bg-surface-alt px-2 text-[13px] text-ink focus:border-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={markAchieved.isPending}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[12px] font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {markAchieved.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save
                    </button>
                  </form>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {milestone.picks?.length ? (
          <AffiliateSection
            title="What you might need now"
            picks={milestone.picks}
            surface="journey"
          />
        ) : null}
      </div>
    </article>
  );
}

function format(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
