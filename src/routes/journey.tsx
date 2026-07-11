import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { AffiliateSection, type AffiliatePick } from "@/components/AffiliateCard";
import journeyScan from "@/assets/journey-scan.jpg";
import journeyCurrent from "@/assets/journey-current.jpg";
import journeyGlucose from "@/assets/journey-glucose.jpg";
import journeyBag from "@/assets/journey-bag.jpg";
import journeyBirthPlan from "@/assets/journey-birthplan.jpg";

export const Route = createFileRoute("/journey")({
  component: JourneyScreen,
});

// TODO: replace `?tag=YOURTAG-20` with your Amazon Associates tag,
// or swap in Babylist/Target affiliate URLs.
type Milestone = {
  week: string;
  title: string;
  body: string;
  state: "done" | "current" | "upcoming";
  photo: string;
  picks?: AffiliatePick[];
};

const MILESTONES: Milestone[] = [
  {
    week: "Week 20", title: "Anatomy scan",
    body: "Detailed ultrasound with your doctor.",
    state: "done", photo: journeyScan,
  },
  {
    week: "Week 24", title: "You are here",
    body: "Baby's hearing sharpens. Time to plan childbirth classes.",
    state: "current", photo: journeyCurrent,
    picks: [
      {
        title: "Belly support band",
        vendor: "Amazon",
        price: "$24",
        blurb: "Eases lower-back pressure as bump grows.",
        url: "https://www.amazon.com/s?k=maternity+belly+band&tag=YOURTAG-20",
        emoji: "🤰",
      },
      {
        title: "Prenatal yoga class",
        vendor: "Glo",
        price: "$18/mo",
        blurb: "On-demand classes tailored to each trimester.",
        url: "https://www.glo.com/?ref=YOURREF",
        emoji: "🧘",
      },
    ],
  },
  {
    week: "Week 28", title: "Glucose test",
    body: "Screening for gestational diabetes.",
    state: "upcoming", photo: journeyGlucose,
    picks: [
      {
        title: "Kick counter journal",
        vendor: "Amazon",
        price: "$12",
        blurb: "Track daily fetal movement patterns.",
        url: "https://www.amazon.com/s?k=kick+count+journal&tag=YOURTAG-20",
        emoji: "📓",
      },
    ],
  },
  {
    week: "Week 32", title: "Hospital bag",
    body: "Start packing essentials for you and baby.",
    state: "upcoming", photo: journeyBag,
    picks: [
      {
        title: "Hospital bag essentials kit",
        vendor: "Babylist",
        price: "$89",
        blurb: "Curated bundle: robe, slippers, toiletries, going-home outfit.",
        url: "https://www.babylist.com/store/hospital-bag?ref=YOURREF",
        emoji: "🎒",
      },
      {
        title: "Newborn diaper starter pack",
        vendor: "Amazon",
        price: "$28",
        blurb: "Size N + wipes — first two weeks covered.",
        url: "https://www.amazon.com/s?k=newborn+diapers+size+n&tag=YOURTAG-20",
        emoji: "🍼",
      },
    ],
  },
  {
    week: "Week 36", title: "Birth plan review",
    body: "Finalize your preferences with your care team.",
    state: "upcoming", photo: journeyBirthPlan,
    picks: [
      {
        title: "Nursing pillow",
        vendor: "Amazon",
        price: "$45",
        blurb: "Supports baby & saves your shoulders during feeds.",
        url: "https://www.amazon.com/s?k=nursing+pillow&tag=YOURTAG-20",
        emoji: "🛋️",
      },
      {
        title: "Baby registry",
        vendor: "Babylist",
        price: "Free",
        blurb: "Add gifts from any store into one shareable list.",
        url: "https://www.babylist.com/?ref=YOURREF",
        emoji: "🎁",
      },
    ],
  },
];

function JourneyScreen() {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Journey"
        title="Your path to meeting baby"
        subtitle="16 weeks to go"
      />

      <div className="px-6">
        <div className="rounded-[1.75rem] bg-gradient-warm p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Third trimester begins
          </div>
          <p className="mt-2 font-display text-[18px] leading-snug text-ink">
            You're 60% of the way there. Small steps now make room for big
            moments soon.
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div className="h-full w-[60%] rounded-full bg-primary" />
          </div>
        </div>

        <section className="mt-7 flex flex-col gap-4">
          {MILESTONES.map((m) => (
            <article
              key={m.title}
              className={`overflow-hidden rounded-[1.75rem] border shadow-soft ${
                m.state === "current"
                  ? "border-accent/40 bg-accent-soft/40"
                  : "border-border bg-surface"
              }`}
            >
              <div className="relative">
                <img
                  src={m.photo}
                  alt={m.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className={`aspect-[16/9] w-full object-cover ${
                    m.state === "upcoming" ? "opacity-70" : ""
                  }`}
                />
                <span
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur ${
                    m.state === "done"
                      ? "bg-primary/90 text-primary-foreground"
                      : m.state === "current"
                        ? "bg-accent/90 text-accent-foreground"
                        : "bg-white/80 text-ink-soft"
                  }`}
                >
                  {m.state === "done" ? "Done" : m.state === "current" ? "Now" : "Upcoming"}
                </span>
              </div>
              <div className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {m.week}
                </div>
                <div className="mt-1 font-display text-[17px] font-semibold text-ink">
                  {m.title}
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                  {m.body}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
