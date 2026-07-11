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
import { useTheme, type Theme } from "@/lib/theme";

const THEME_OPTIONS: { id: Theme; label: string; swatch: string }[] = [
  { id: "neutral", label: "Grey", swatch: "oklch(0.55 0.02 260)" },
  { id: "girl", label: "Pink", swatch: "oklch(0.7 0.13 12)" },
  { id: "boy", label: "Blue", swatch: "oklch(0.62 0.1 240)" },
];


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
        <ThemePicker />

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

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <section className="mb-6">
      <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        App theme
      </h3>
      <div className="rounded-3xl border border-border bg-surface p-4">
        <div className="text-[13px] text-ink-soft">
          Same design, tuned to your baby.
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-[0.97] ${
                  active
                    ? "border-primary/50 bg-primary-soft/60 ring-2 ring-primary/30"
                    : "border-border bg-background"
                }`}
              >
                <span
                  className="h-8 w-8 rounded-full shadow-soft"
                  style={{ background: opt.swatch }}
                />
                <span className="text-[12.5px] font-semibold text-ink">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

