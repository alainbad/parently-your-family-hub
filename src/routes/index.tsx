import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useTheme, THEME_PHOTOS, type Theme } from "@/lib/theme";
import logoNewborn from "@/assets/logo-newborn.jpg";


export const Route = createFileRoute("/")({
  component: Welcome,
});

const OPTIONS: {
  id: Theme;
  title: string;
  hint: string;
  photo: string;
}[] = [
  {
    id: "girl",
    title: "It's a girl",
    hint: "Rose theme",
    photo: THEME_PHOTOS.girl,
  },
  {
    id: "boy",
    title: "It's a boy",
    hint: "Sky theme",
    photo: THEME_PHOTOS.boy,
  },
  {
    id: "neutral",
    title: "We don't know yet",
    hint: "Gentle grey theme",
    photo: THEME_PHOTOS.neutral,
  },
];

function Welcome() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-gradient-hero">
      <header className="safe-top flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-2xl shadow-soft">
            <img
              src={logoNewborn}
              alt="Parently newborn logo"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Parently
          </span>
        </div>

      </header>

      <main className="flex flex-1 flex-col px-6 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Welcome
        </p>
        <h1 className="mt-2 font-display text-[30px] leading-[1.1] font-medium text-ink">
          Let's begin with your{" "}
          <span className="italic text-accent">little one</span>.
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
          Pick what you know today — you can change this anytime.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`group relative overflow-hidden rounded-3xl border text-left transition-all active:scale-[0.99] ${
                  active
                    ? "border-primary/50 shadow-lift ring-2 ring-primary/30"
                    : "border-border shadow-soft"
                }`}
              >
                <div className="grid grid-cols-[112px_minmax(0,1fr)] items-stretch bg-surface">
                  <div className="relative h-full w-28 overflow-hidden">
                    <img
                      src={opt.photo}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <div className="font-display text-[17px] font-semibold text-ink">
                        {opt.title}
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-ink-soft">
                        {opt.hint}
                      </div>
                    </div>
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-transparent text-transparent"
                      }`}
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="safe-bottom sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-4">
        <button
          onClick={() => navigate({ to: "/onboarding" })}
          className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
        >
          Continue
        </button>
        <p className="mt-3 text-center text-xs text-ink-soft">
          You can update this later in your profile.
        </p>
      </footer>
    </div>
  );
}
