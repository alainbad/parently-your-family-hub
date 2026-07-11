import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import learnPregnancy from "@/assets/learn-pregnancy.jpg";
import learnFeeding from "@/assets/learn-feeding.jpg";
import learnSleep from "@/assets/learn-sleep.jpg";
import learnFirstAid from "@/assets/learn-firstaid.jpg";

export const Route = createFileRoute("/learn")({
  component: LearnScreen,
});

const CATEGORIES = [
  { label: "Pregnancy", photo: learnPregnancy },
  { label: "Feeding", photo: learnFeeding },
  { label: "Sleep", photo: learnSleep },
  { label: "First aid", photo: learnFirstAid },
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
        <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[1.25rem] border border-border bg-surface px-4 py-3 shadow-soft">
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
            {CATEGORIES.map(({ label, photo }) => (
              <button
                key={label}
                className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-surface text-left shadow-soft transition-transform active:scale-[0.98]"
              >
                <img
                  src={photo}
                  alt={label}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3 font-display text-[15px] font-semibold text-white">
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
            <button className="text-xs font-semibold text-primary">See all</button>
          </div>
          <div className="flex flex-col gap-3">
            {ARTICLES.map((a) => (
              <article
                key={a.title}
                className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-soft"
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
