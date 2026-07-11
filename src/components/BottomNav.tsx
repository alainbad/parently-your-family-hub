import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Home, LineChart, Plus, User, Waypoints } from "lucide-react";

const TABS = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/track", label: "Track", Icon: LineChart },
  { to: "/journey", label: "Journey", Icon: Waypoints },
  { to: "/learn", label: "Learn", Icon: BookOpen },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 safe-bottom">
      <div className="pointer-events-auto relative mx-auto max-w-md px-4 pb-3 pt-2">
        {/* Floating quick log button */}
        <button
          type="button"
          aria-label="Quick log"
          className="absolute -top-6 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-accent text-accent-foreground shadow-lift ring-4 ring-background transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
        <div className="grid grid-cols-5 items-end rounded-3xl border border-border bg-surface/95 px-2 py-2 shadow-soft backdrop-blur">
          {TABS.map(({ to, label, Icon }, i) => {
            const active = pathname === to;
            // Leave a visual gap for the floating button between tabs 2 and 3
            const middleGap = i === 2 ? "invisible" : "";
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${middleGap} ${
                  active ? "text-primary" : "text-ink-soft"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
