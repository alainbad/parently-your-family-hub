import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

const PAGE_URL = "https://parently-babytracking.com/support";
const CONTACT_EMAIL = "badranalain87@gmail.com";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Parently" },
      {
        name: "description",
        content: "Get help with Parently — contact us or browse common questions.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Support — Parently" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: SupportPage,
});

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I cancel my Parently AI subscription?",
    a: "On iPhone: Settings → your name → Subscriptions → Parently → Cancel Subscription. On Android: Play Store → Menu → Subscriptions → Parently → Cancel. Cancelling stops future billing; you keep access until the current period ends.",
  },
  {
    q: "How do I delete my account and data?",
    a: "Email us at the address below and we'll delete your account and all associated data.",
  },
  {
    q: "How do I invite my partner to share our household?",
    a: "Go to Profile → Family sharing → Invite, and send them the invite. Once they accept, you'll both see and log the same appointments, reminders, and growth entries.",
  },
  {
    q: "I forgot my password — how do I reset it?",
    a: 'On the sign-in screen, tap "Forgot password?" and follow the emailed link. If you signed up with Google, use the "Continue with Google" button instead.',
  },
];

function SupportPage() {
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-2xl px-6 pb-16 pt-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Parently
      </Link>

      <h1 className="mt-6 font-display text-[26px] font-semibold leading-[1.15] text-ink">
        Support
      </h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
        Need help with something? We're happy to answer.
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground shadow-soft"
      >
        <Mail className="h-4 w-4" />
        {CONTACT_EMAIL}
      </a>

      <div className="mt-8 flex flex-col gap-5">
        <h2 className="font-display text-[17px] font-semibold text-ink">Common questions</h2>
        {FAQS.map(({ q, a }) => (
          <div key={q} className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
            <p className="text-[14.5px] font-semibold text-ink">{q}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
