import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogIn, Ruler, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { profileQuery } from "@/lib/profile";
import { PREGNANCY_PHOTO } from "@/lib/theme";
import logoNewborn from "@/assets/logo-newborn.jpg";

const SITE_URL = "https://parently-babytracking.com/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "Parently",
          url: SITE_URL,
          description:
            "Parently is a warm, calm parenting companion for pregnancy through age 5 — tracking, milestones, and gentle guidance for both parents.",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      },
    ],
  }),
  component: Landing,
});

const FEATURES: { icon: typeof Sparkles; title: string; body: string }[] = [
  {
    icon: Sparkles,
    title: "Quick logs",
    body: "Tap once to log symptoms, water, meals, feeds, sleep, and diaper changes — no forms to fill out.",
  },
  {
    icon: Ruler,
    title: "Growth tracking",
    body: "Chart weight, height, and head circumference over time and see the trend at a glance.",
  },
  {
    icon: Bell,
    title: "Reminders & vaccinations",
    body: "Schedule appointments and doses ahead of time, then mark them given when they happen.",
  },
  {
    icon: Users,
    title: "Family sharing",
    body: "Invite your partner so you both see and log the same appointments, reminders, and growth entries.",
  },
];

function Landing() {
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery(profileQuery(user?.id));

  useEffect(() => {
    if (loading || !session) return;
    // Signed in — this page is only for signed-out visitors, route onward.
    navigate({ to: profile.data?.stage ? "/home" : "/get-started", replace: true });
  }, [loading, navigate, session, profile.data]);

  if (loading || session) return null;

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-gradient-hero">
      <header className="safe-top flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2.5">
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
        <Link
          to="/auth"
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-soft"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-6 pt-6">
        <section className="relative overflow-hidden rounded-[2rem] shadow-lift">
          <img
            src={PREGNANCY_PHOTO}
            alt="A parent gently cradling their bump"
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-90">
              <Sparkles className="h-3.5 w-3.5" />
              For growing families
            </div>
            <h1 className="mt-2 font-display text-[28px] leading-[1.08] font-semibold">
              A calm companion for pregnancy through age 5.
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed opacity-95">
              Track the little things, stay ahead of appointments, and share it all with your
              partner — one gentle app for both of you.
            </p>
          </div>
        </section>

        <section className="mt-7">
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-2.5 rounded-[1.5rem] border border-border bg-surface p-4 shadow-soft"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-[14.5px] font-semibold text-ink">{title}</span>
                <span className="text-[12px] leading-relaxed text-ink-soft">{body}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="safe-bottom sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-6 pb-6 pt-4">
        <Link
          to="/auth"
          className="inline-flex h-14 w-full items-center justify-center rounded-[1.25rem] bg-primary text-base font-semibold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
        >
          Get started — it's free
        </Link>
        <p className="mt-3 text-center text-xs text-ink-soft">
          Save your logs and pick up where you left off, on any device.
        </p>
      </footer>
    </div>
  );
}
