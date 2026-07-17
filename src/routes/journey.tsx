import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
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
  atWeek: number;
  label: string;
  title: string;
  body: string;
  photo: string;
  picks?: AffiliatePick[];
};

const PREGNANCY_MILESTONES: Milestone[] = [
  {
    atWeek: 20,
    label: "Week 20",
    title: "Anatomy scan",
    body: "Detailed ultrasound with your doctor.",
    photo: journeyScan,
  },
  {
    atWeek: 24,
    label: "Week 24",
    title: "Hearing & childbirth classes",
    body: "Baby's hearing sharpens. Time to plan childbirth classes.",
    photo: journeyCurrent,
    picks: JOURNEY_PICKS_BY_WEEK["Week 24"],
  },
  {
    atWeek: 28,
    label: "Week 28",
    title: "Glucose test",
    body: "Screening for gestational diabetes.",
    photo: journeyGlucose,
    picks: JOURNEY_PICKS_BY_WEEK["Week 28"],
  },
  {
    atWeek: 32,
    label: "Week 32",
    title: "Hospital bag",
    body: "Start packing essentials for you and baby.",
    photo: journeyBag,
    picks: JOURNEY_PICKS_BY_WEEK["Week 32"],
  },
  {
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

  if (answers?.stage === "pregnancy" && answers.dueDate) {
    return <PregnancyJourney dueDate={answers.dueDate} />;
  }
  if (answers && answers.stage !== "pregnancy" && answers.birthDate) {
    return <StageJourney stage={answers.stage} birthDate={answers.birthDate} />;
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

function PregnancyJourney({ dueDate }: { dueDate: string }) {
  const week = pregnancyWeek(dueDate);
  const percent = Math.min(100, Math.max(0, Math.round((week / 40) * 100)));
  const weeksToGo = Math.max(0, 40 - week);
  const states = withStates(PREGNANCY_MILESTONES, week);

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
            <MilestoneCard key={m.title} milestone={m} state={states[i]} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function StageJourney({
  stage,
  birthDate,
}: {
  stage: Exclude<Stage, "pregnancy">;
  birthDate: string;
}) {
  const currentWeeks = ageInWeeks(birthDate);
  const items = STAGE_MILESTONES[stage];
  const states = withStates(items, currentWeeks);
  const photo = STAGE_PHOTOS[stage];

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
              key={m.title}
              milestone={{
                atWeek: m.atWeek,
                label: ageWeeksLabel(m.atWeek),
                title: m.title,
                body: m.body,
                photo,
              }}
              state={states[i]}
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function MilestoneCard({ milestone, state }: { milestone: Milestone; state: MilestoneState }) {
  return (
    <article
      className={`overflow-hidden rounded-[1.75rem] border shadow-soft ${
        state === "current" ? "border-accent/40 bg-accent-soft/40" : "border-border bg-surface"
      }`}
    >
      <div className="relative">
        <img
          src={milestone.photo}
          alt={milestone.title}
          loading="lazy"
          width={1024}
          height={1024}
          className={`aspect-[16/9] w-full object-cover ${state === "upcoming" ? "opacity-70" : ""}`}
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur ${
            state === "done"
              ? "bg-primary/90 text-primary-foreground"
              : state === "current"
                ? "bg-accent/90 text-accent-foreground"
                : "bg-white/80 text-ink-soft"
          }`}
        >
          {state === "done" ? "Done" : state === "current" ? "Now" : "Upcoming"}
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
