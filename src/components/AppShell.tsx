import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background">
      <div className="flex-1 pb-32">{children}</div>
      <BottomNav />
    </div>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="safe-top grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-6 pb-5 pt-6">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-[26px] leading-[1.1] font-semibold text-ink">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}
