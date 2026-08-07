import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const PAGE_URL = "https://parently-babytracking.com/privacy";
const CONTACT_EMAIL = "badranalain87@gmail.com";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Parently" },
      {
        name: "description",
        content: "How Parently collects, uses, and protects your family's data.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy — Parently" },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
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
        Privacy Policy
      </h1>
      <p className="mt-2 text-[13px] text-ink-soft">Last updated: August 2026</p>

      <div className="mt-6 flex flex-col gap-6 text-[14.5px] leading-relaxed text-ink">
        <p>
          Parently ("we," "us") makes this app to help parents track pregnancy, baby logs, growth,
          milestones, and reminders. This policy explains what information we collect, why, and how
          you can control it.
        </p>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">Who this covers</h2>
          <p className="mt-2">
            Parently accounts are created and controlled by an adult parent or guardian. Any
            information about a child — name, birthday, photo, logs — is entered by that adult
            account holder. We do not knowingly collect information directly from children, and the
            app is not directed at children as users.
          </p>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">
            Information we collect
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong>Account information:</strong> your email address, used to sign in (directly or
              via Google Sign-In).
            </li>
            <li>
              <strong>Profile information:</strong> your baby's name, photo, birth date or due date,
              and current stage.
            </li>
            <li>
              <strong>Logged activity:</strong> quick logs (symptoms, water, meals, sleep), baby
              logs, growth measurements, vaccination and reminder records, and milestones you mark
              as achieved.
            </li>
            <li>
              <strong>Family sharing:</strong> if you invite a partner to share your household, we
              store the invite and which account it links to.
            </li>
            <li>
              <strong>Parently AI conversations:</strong> messages you send to the AI chat feature
              are stored so your conversation history is available across your devices, and are sent
              to our AI provider to generate responses.
            </li>
            <li>
              <strong>Subscription status:</strong> whether you have an active Parently AI
              subscription. Payment details (card numbers, etc.) are handled entirely by Apple,
              Google, or our billing partner RevenueCat — we never see or store them.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">
            How we use this information
          </h2>
          <p className="mt-2">
            To run the app: save and sync your logs, show your baby's stage-appropriate content,
            remind you about upcoming appointments, power the AI chat, and manage your subscription.
            We do not sell your data, and we do not run third-party advertising or analytics inside
            the app.
          </p>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">Who we share it with</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong>Supabase</strong> hosts our database and handles authentication.
            </li>
            <li>
              Our <strong>AI provider</strong> processes messages you send to Parently AI in order
              to generate a response.
            </li>
            <li>
              <strong>Apple, Google, and RevenueCat</strong> process subscription payments and tell
              us whether your subscription is active.
            </li>
            <li>
              Product links in the Shop and Journey sections go to third-party retailers (e.g.
              Amazon). If you click through, their own privacy policy applies once you leave
              Parently.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">Your choices</h2>
          <p className="mt-2">
            You can edit or delete individual logs, reminders, and milestones at any time in the
            app. To request a full export or deletion of your account and all associated data, email
            us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary">
              {CONTACT_EMAIL}
            </a>{" "}
            and we'll process it promptly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">Security</h2>
          <p className="mt-2">
            Your data is stored with industry-standard encryption in transit and at rest. Access to
            your household's data is restricted to accounts you've explicitly invited.
          </p>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">
            Changes to this policy
          </h2>
          <p className="mt-2">
            If we make material changes to this policy, we'll update the date at the top of this
            page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-[17px] font-semibold text-ink">Contact us</h2>
          <p className="mt-2">
            Questions about this policy or your data?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
