import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  Heart,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";

export const Route = createFileRoute("/profile")({
  component: ProfileScreen,
});

const GROUPS = [
  {
    label: "Family",
    items: [
      { Icon: Users, label: "Family members", meta: "3 people" },
      { Icon: Heart, label: "Children", meta: "1 child" },
    ],
  },
  {
    label: "Preferences",
    items: [
      { Icon: Bell, label: "Notifications" },
      { Icon: Globe, label: "Language & country", meta: "English · US" },
      { Icon: Shield, label: "Privacy" },
      { Icon: CreditCard, label: "Subscription", meta: "Free" },
    ],
  },
];

function ProfileScreen() {
  return (
    <AppShell>
      <ScreenHeader eyebrow="Profile" title="You & your family" />

      <div className="px-6">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-sage font-display text-lg font-semibold text-primary-foreground">
              SA
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-[18px] font-semibold text-ink">
                Sara Ahmed
              </div>
              <div className="mt-0.5 truncate text-[13px] text-ink-soft">
                Expecting · Week 24
              </div>
            </div>
            <button className="rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-ink-soft">
              Edit
            </button>
          </div>
        </section>

        {GROUPS.map((group) => (
          <section key={group.label} className="mt-6">
            <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              {group.label}
            </h3>
            <div className="overflow-hidden rounded-3xl border border-border bg-surface">
              {group.items.map((item, i) => (
                <button
                  key={item.label}
                  className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-4 text-left transition-colors active:bg-surface-muted ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <item.Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate text-[15px] font-medium text-ink">
                    {item.label}
                  </span>
                  {item.meta ? (
                    <span className="text-[12px] text-ink-soft">
                      {item.meta}
                    </span>
                  ) : (
                    <span />
                  )}
                  <ChevronRight className="h-4 w-4 text-ink-soft" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-6">
          <Link
            to="/"
            className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="min-w-0 truncate text-[15px] font-medium text-ink">
              Sign out
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
