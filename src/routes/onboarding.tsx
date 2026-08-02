import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useSaveProfile } from "@/lib/profile";
import { STAGES, saveLocalStageAnswers, type Stage } from "@/lib/baby-stage";
import onboardingHero from "@/assets/onboarding-hero.jpg";
import stagePregnancy from "@/assets/stage-pregnancy.jpg";
import stageNewborn from "@/assets/stage-newborn.jpg";
import stageBaby from "@/assets/stage-baby.jpg";
import stageToddler from "@/assets/stage-toddler.jpg";
import stagePreschool from "@/assets/stage-preschool.jpg";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const STAGE_PHOTOS: Record<Stage, string> = {
  pregnancy: stagePregnancy,
  newborn: stageNewborn,
  baby: stageBaby,
  toddler: stageToddler,
  preschool: stagePreschool,
};

function Onboarding() {
  const [selected, setSelected] = useState<Stage>("pregnancy");
  const [dueDate, setDueDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const saveProfile = useSaveProfile(user?.id);

  const continueOnboarding = async () => {
    const answers =
      selected === "pregnancy"
        ? { stage: selected, dueDate: dueDate || undefined }
        : { stage: selected, birthDate: birthDate || undefined };

    saveLocalStageAnswers(answers);

    if (user) {
      try {
        await saveProfile.mutateAsync({
          stage: selected,
          due_date: selected === "pregnancy" ? dueDate || null : null,
          birth_date: selected !== "pregnancy" ? birthDate || null : null,
        });
      } catch (err) {
        // Already cached locally above — OnboardingSync will retry the
        // profile sync later. Don't let a failed write block onboarding.
        console.error("[onboarding] profile sync failed", err);
      }
    }

    navigate({ to: "/home" });
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background">
      {/* Hero photo */}
      <div className="relative">
        <img
          src={onboardingHero}
          alt="A parent holding baby's hand"
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-background" />

        <header className="safe-top absolute inset-x-0 top-0 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-5">
          <Link
            to="/get-started"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-ink shadow-soft backdrop-blur transition-colors active:bg-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5 justify-self-center">
            <span className="h-1.5 w-6 rounded-full bg-white" />
            <span className="h-1.5 w-6 rounded-full bg-white/50" />
            <span className="h-1.5 w-6 rounded-full bg-white/50" />
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
            1 / 3
          </span>
        </header>

        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-90">
            Let's begin
          </p>
          <h1 className="mt-2 font-display text-[2rem] leading-[1.05] font-semibold">
            Where are you in your family journey?
          </h1>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-6 pt-6">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          We'll shape Parently around your stage. You can change this any time.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {STAGES.map(({ id, label, hint }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[1.5rem] border p-2 pr-4 text-left transition-all active:scale-[0.99] ${
                  active
                    ? "border-primary/50 bg-primary-soft/50 shadow-soft"
                    : "border-border bg-surface"
                }`}
              >
                <img
                  src={STAGE_PHOTOS[id]}
                  alt={label}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-16 w-16 shrink-0 rounded-[1.1rem] object-cover"
                />
                <span className="min-w-0">
                  <span className="block font-display text-[16px] font-semibold text-ink">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{hint}</span>
                </span>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent"
                  }`}
                >
                  {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {selected === "pregnancy" ? "Expected due date" : "Baby's birth date"}
          </span>
          <input
            type="date"
            value={selected === "pregnancy" ? dueDate : birthDate}
            onChange={(e) =>
              selected === "pregnancy" ? setDueDate(e.target.value) : setBirthDate(e.target.value)
            }
            className="h-12 rounded-[1rem] border border-border bg-surface px-4 text-[14px] text-ink focus:border-primary focus:outline-none"
          />
          <span className="text-[12px] text-ink-soft">
            Lets us show the right week or age everywhere — you can skip this and add it later from
            your profile.
          </span>
        </label>
      </main>

      <footer className="safe-bottom sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-4">
        <button
          onClick={continueOnboarding}
          disabled={saveProfile.isPending}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
