import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import {
  CATEGORY_PHOTOS,
  LEARN_ARTICLES,
  LEARN_CATEGORIES,
  type LearnCategory,
} from "@/lib/learn-articles";

const LEARN_URL = "https://parently-babytracking.com/learn";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn — Parently" },
      {
        name: "description",
        content:
          "Short, practical articles on pregnancy, feeding, sleep, and first aid — written for parents who need the answer, not a wall of text.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Learn — Parently" },
      { property: "og:url", content: LEARN_URL },
    ],
    links: [{ rel: "canonical", href: LEARN_URL }],
  }),
  component: LearnScreen,
});

const PICKS_COUNT = 3;

function LearnScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LearnCategory | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEARN_ARTICLES.filter((a) => {
      if (category && a.category !== category) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q);
    });
  }, [query, category]);

  const isFiltering = Boolean(query.trim()) || category !== null;
  const visible = isFiltering || showAll ? filtered : filtered.slice(0, PICKS_COUNT);

  const heading = category
    ? `${category} articles`
    : query.trim()
      ? `Results for "${query.trim()}"`
      : "Editor's picks";

  return (
    <AppShell>
      <ScreenHeader eyebrow="Learn" title="Grow with your baby" />

      <div className="px-6">
        <label className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] border border-border bg-surface px-4 py-3 shadow-soft">
          <Search className="h-4 w-4 text-ink-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, courses, questions"
            className="min-w-0 bg-transparent text-[14px] text-ink placeholder:text-ink-soft focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="grid h-6 w-6 place-items-center rounded-full text-ink-soft"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </label>

        <section className="mt-6">
          <h3 className="mb-3 font-display text-[17px] font-semibold text-ink">Explore by topic</h3>
          <div className="grid grid-cols-2 gap-3">
            {LEARN_CATEGORIES.map((label) => {
              const active = category === label;
              return (
                <button
                  key={label}
                  onClick={() => setCategory(active ? null : label)}
                  className={`group relative overflow-hidden rounded-[1.5rem] border text-left shadow-soft transition-transform active:scale-[0.98] ${
                    active ? "border-primary ring-2 ring-primary/30" : "border-border"
                  } bg-surface`}
                >
                  <img
                    src={CATEGORY_PHOTOS[label]}
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
              );
            })}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[17px] font-semibold text-ink">{heading}</h3>
            {!isFiltering && filtered.length > PICKS_COUNT ? (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-xs font-semibold text-primary"
              >
                {showAll ? "Show less" : "See all"}
              </button>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-center text-sm text-ink-soft">
              Nothing matches yet — try a different search or topic.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map((a) => (
                <Link
                  key={a.id}
                  to="/learn/$articleId"
                  params={{ articleId: a.id }}
                  className="block rounded-[1.5rem] border border-border bg-surface p-4 shadow-soft transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    <span>{a.tag}</span>
                    <span className="text-ink-soft">·</span>
                    <span className="text-ink-soft">{a.category}</span>
                  </div>
                  <h4 className="mt-1 font-display text-[16px] font-semibold leading-snug text-ink">
                    {a.title}
                  </h4>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
                    {a.excerpt}
                  </p>
                  <div className="mt-2 text-[12px] text-ink-soft">{a.readTime}</div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
