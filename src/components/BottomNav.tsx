import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Home, LineChart, Milestone, Sparkles, User } from "lucide-react";

const LEFT_TABS = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/track", label: "Track", Icon: LineChart },
  { to: "/journey", label: "Journey", Icon: Milestone },
] as const;

const RIGHT_TABS = [
  { to: "/learn", label: "Learn", Icon: BookOpen },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

function NavLink({
  to,
  label,
  Icon,
  active,
}: {
  to: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold tracking-tight transition-colors ${
        active ? "text-primary" : "text-ink-soft"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
      <span>{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 safe-bottom">
      <div className="pointer-events-auto relative mx-auto max-w-md px-5 pb-5 pt-2">
        <div className="grid grid-cols-6 items-center rounded-[2rem] border border-border bg-surface/95 px-2 py-2 shadow-soft backdrop-blur">
          {LEFT_TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              label={label}
              Icon={Icon}
              active={pathname === to}
            />
          ))}

          <div className="relative -top-4 flex justify-center">
            <Link
              to="/chat"
              aria-label="Ask Nurture AI"
              className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-float ring-4 ring-background transition-transform active:scale-95"
            >
              <Sparkles className="h-6 w-6" />
            </Link>
          </div>

          {RIGHT_TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              label={label}
              Icon={Icon}
              active={pathname === to}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
