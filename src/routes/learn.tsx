import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, PlayCircle, Search, ShieldPlus } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";

export const Route = createFileRoute("/learn")({
  component: LearnScreen,
});

const CATEGORIES = [
  { label: "Pregnancy", Icon: BookOpen, tint: "primary" as const },
  { label: "Feeding", Icon: GraduationCap, tint: "accent" as const },
  { label: "Sleep", Icon: PlayCircle, tint: "primary" as const },
  { label: "First aid", Icon: ShieldPlus, tint: "accent" as const },
];

const ARTICLES = [
  {
    tag: "Trimester 2",
    title: "Sleeping positions that ease back pain",
    read: "4 min read",
  },
  {
    tag: "Nutrition",
    title: "Iron-rich meals your partner can prep in 15 minutes",
    read: "6 min read",
  },
  {
    tag: "Mind",
    title: "A gentle grounding practice for restless evenings",
    read: "3 min read",
  },
];

function LearnScreen() {
  return (
    <AppShell>
      <ScreenHeader eyebrow="Learn" title="Grow with your baby" />

      <div className="px-6">
        <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <Search className="h-4 w-4 text-ink-soft" />
          <input
            type="search"
            placeholder="Search articles, courses, questions"
            className="min-w-0 bg-transparent text-[14px] text-ink placeholder:text-ink-soft focus:outline-none"
          />
        </label>

        <section className="mt-6">
          <h3 className="mb-3 font-display text-[17px] font-semibold text-ink">
            Explore by topic
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(({ label, Icon, tint }) => (
              <button
                key={label}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-border bg-surface p-4 text-left"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                    tint === "primary"
                      ? "bg-primary-soft text-primary"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 truncate font-display text-[15px] font-semibold text-ink">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Editor's picks
            </h3>
            <button className="text-xs font-medium text-primary">
              See all
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {ARTICLES.map((a) => (
              <article
                key={a.title}
                className="rounded-3xl border border-border bg-surface p-4"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {a.tag}
                </div>
                <h4 className="mt-1 font-display text-[16px] font-semibold leading-snug text-ink">
                  {a.title}
                </h4>
                <div className="mt-2 text-[12px] text-ink-soft">{a.read}</div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
