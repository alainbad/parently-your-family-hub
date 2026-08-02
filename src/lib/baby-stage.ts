import { useEffect, useState } from "react";

export type Stage = "pregnancy" | "newborn" | "baby" | "toddler" | "preschool";

export const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "pregnancy", label: "Pregnant", hint: "Week by week guidance for you and baby" },
  { id: "newborn", label: "Newborn", hint: "0–3 months · feeding, sleep, recovery" },
  { id: "baby", label: "Baby", hint: "3–12 months · milestones and first foods" },
  { id: "toddler", label: "Toddler", hint: "1–3 years · play, language, rhythms" },
  { id: "preschool", label: "Preschool", hint: "3–5 years · learning and emotions" },
];

export const STAGE_HERO_LINES: Record<Stage, string> = {
  pregnancy: "Baby's growing right on track this week.",
  newborn: "Every day brings a new small milestone.",
  baby: "So much changes week to week at this age.",
  toddler: "Big feelings, bigger personality — right on schedule.",
  preschool: "Curious, capable, and growing more independent every day.",
};

export type StageAnswers = {
  stage: Stage;
  dueDate?: string; // ISO date (yyyy-mm-dd), pregnancy only
  birthDate?: string; // ISO date (yyyy-mm-dd), all other stages
};

const STORAGE_KEY = "parently.stageAnswers";

export function saveLocalStageAnswers(answers: StageAnswers) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // ignore
  }
}

export function readLocalStageAnswers(): StageAnswers | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StageAnswers;
  } catch {
    return null;
  }
}

export function clearLocalStageAnswers() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** SSR-safe: null on the server and on the client's first render, then
 * hydrates from localStorage after mount (same pattern as ThemeProvider). */
export function useLocalStageAnswers(): StageAnswers | null {
  const [answers, setAnswers] = useState<StageAnswers | null>(null);
  useEffect(() => {
    setAnswers(readLocalStageAnswers());
  }, []);
  return answers;
}

/** Once a birth date is known, which stage bucket it falls into is fully
 * computable from age — so age (not a manually-picked, easily-stale field)
 * is the source of truth for anything post-birth. "pregnancy" is the one
 * value that can't be derived this way, since there's no birth date yet. */
export function deriveStage(
  stage: Stage,
  birthDate: string | null | undefined,
  today: Date = new Date(),
): Stage {
  if (stage === "pregnancy" || !birthDate) return stage;
  const weeks = ageInWeeks(birthDate, today);
  if (weeks < 13) return "newborn"; // 0-3 months
  if (weeks < 52) return "baby"; // 3-12 months
  if (weeks < 156) return "toddler"; // 1-3 years
  return "preschool"; // 3-5 years
}

/** Prefer the signed-in profile's stage data; fall back to the local,
 * pre-sign-in answers only when signed out (once signed in, OnboardingSync
 * either already synced them or there's nothing to show yet). Stage is
 * re-derived from age so it can't silently go stale as baby grows. */
export function resolveStageAnswers(
  isSignedIn: boolean,
  profileFields:
    { stage: Stage | null; due_date: string | null; birth_date: string | null } | null | undefined,
  localAnswers: StageAnswers | null,
): StageAnswers | null {
  const raw = profileFields?.stage
    ? {
        stage: profileFields.stage,
        dueDate: profileFields.due_date ?? undefined,
        birthDate: profileFields.birth_date ?? undefined,
      }
    : !isSignedIn
      ? localAnswers
      : null;
  if (!raw) return null;
  return { ...raw, stage: deriveStage(raw.stage, raw.birthDate) };
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** ISO "yyyy-mm-dd" parsed as a local calendar date, not UTC midnight. */
function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Standard 40-week (280-day) pregnancy convention, clamped to 1–42. */
export function pregnancyWeek(dueDateIso: string, today: Date = new Date()): number {
  const dueDate = parseDateOnly(dueDateIso);
  const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / MS_PER_DAY);
  const week = 40 - Math.round(daysUntilDue / 7);
  return Math.min(42, Math.max(1, week));
}

export function ageInWeeks(birthDateIso: string, today: Date = new Date()): number {
  const birthDate = parseDateOnly(birthDateIso);
  return Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / MS_PER_WEEK));
}

export function ageLabel(birthDateIso: string, today: Date = new Date()): string {
  const weeks = ageInWeeks(birthDateIso, today);
  if (weeks < 1) return "Born this week";
  if (weeks < 12) return `${weeks} week${weeks === 1 ? "" : "s"} old`;
  const months = Math.floor(weeks / 4.345);
  if (months < 24) return `${months} month${months === 1 ? "" : "s"} old`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} old`;
}

/** Short headline for the Home hero card, given whatever we know. */
export function stageHeroLine(
  stage: Stage,
  dueDate: string | null | undefined,
  birthDate: string | null | undefined,
  today: Date = new Date(),
): { eyebrow: string; title: string } | null {
  if (stage === "pregnancy" && dueDate) {
    return { eyebrow: `Week ${pregnancyWeek(dueDate, today)}`, title: STAGE_HERO_LINES.pregnancy };
  }
  if (stage !== "pregnancy" && birthDate) {
    return { eyebrow: ageLabel(birthDate, today), title: STAGE_HERO_LINES[stage] };
  }
  return null;
}

export type StageMilestone = {
  /** Stable key used to store achievement records — never rename once shipped. */
  id: string;
  /** Pregnancy: week number (1-42). Other stages: age in weeks. */
  atWeek: number;
  title: string;
  body: string;
};

// Age thresholds are typical ranges, not medical guidance — same spirit as
// the existing pregnancy milestone list already in journey.tsx.
export const STAGE_MILESTONES: Record<Exclude<Stage, "pregnancy">, StageMilestone[]> = {
  newborn: [
    {
      id: "newborn-pediatrician-visit",
      atWeek: 1,
      title: "First pediatrician visit",
      body: "Weight check and a first look at how feeding's going.",
    },
    {
      id: "newborn-cord-stump",
      atWeek: 2,
      title: "Umbilical cord stump falls off",
      body: "Typically within the first couple of weeks.",
    },
    {
      id: "newborn-6-week-checkup",
      atWeek: 6,
      title: "6-week checkup & first vaccines",
      body: "A bigger visit — growth, development, and immunizations.",
    },
    {
      id: "newborn-first-smiles",
      atWeek: 8,
      title: "First real smiles",
      body: "Social smiling usually starts to show up around now.",
    },
  ],
  baby: [
    {
      id: "baby-rolling-over",
      atWeek: 17,
      title: "Rolling over",
      body: "Front-to-back and back-to-front, usually around 4 months.",
    },
    {
      id: "baby-starting-solids",
      atWeek: 26,
      title: "Starting solids",
      body: "Most babies are ready for first foods around 6 months.",
    },
    {
      id: "baby-crawling",
      atWeek: 39,
      title: "Crawling",
      body: "Some scoot, some crawl, some skip it entirely — all typical.",
    },
    {
      id: "baby-first-steps",
      atWeek: 52,
      title: "First steps",
      body: "Anywhere from 9–18 months is completely normal.",
    },
  ],
  toddler: [
    {
      id: "toddler-first-words",
      atWeek: 65,
      title: "First words",
      body: "A handful of clear words is typical around 15 months.",
    },
    {
      id: "toddler-running-climbing",
      atWeek: 78,
      title: "Running & climbing",
      body: "Big gross-motor leaps around 18 months.",
    },
    {
      id: "toddler-two-word-phrases",
      atWeek: 104,
      title: "Two-word phrases",
      body: '"More milk", "go outside" — combining words around age 2.',
    },
    {
      id: "toddler-potty-readiness",
      atWeek: 156,
      title: "Potty training readiness",
      body: "Most toddlers show signs of readiness by age 3.",
    },
  ],
  preschool: [
    {
      id: "preschool-pretend-play",
      atWeek: 156,
      title: "Pretend play takes off",
      body: "Imaginary friends, dress-up, elaborate storylines.",
    },
    {
      id: "preschool-pre-writing",
      atWeek: 195,
      title: "Pre-writing skills",
      body: "Holding crayons, copying shapes, tracing letters.",
    },
    {
      id: "preschool-multi-step-directions",
      atWeek: 234,
      title: "Following multi-step directions",
      body: '"Pick up your shoes and put them by the door."',
    },
    {
      id: "preschool-kindergarten-readiness",
      atWeek: 260,
      title: "Kindergarten readiness",
      body: "Sharing, taking turns, and early letter/number recognition.",
    },
  ],
};
