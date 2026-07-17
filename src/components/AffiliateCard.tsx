import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type AffiliatePick = {
  title: string;
  vendor: string;
  price?: string;
  blurb: string;
  url: string;
  emoji: string;
};

function logAffiliateClick(pick: AffiliatePick, surface: string, userId?: string) {
  // Fire-and-forget: the card opens in a new tab, so this never blocks navigation.
  // Errors are swallowed — click tracking must never break the affiliate link itself.
  void supabase
    .from("affiliate_clicks")
    .insert({
      surface,
      vendor: pick.vendor,
      title: pick.title,
      url: pick.url,
      user_id: userId ?? null,
    })
    .then(({ error }: { error: { message: string } | null }) => {
      if (error) console.error("[affiliate_clicks] insert failed", error);
    });
}

/**
 * Affiliate product recommendation card.
 * Links open in a new tab with rel="sponsored noopener" per FTC + Amazon Associates guidelines.
 * Wrap your affiliate URL with your tracking tag before passing in.
 */
export function AffiliateCard({ pick, surface }: { pick: AffiliatePick; surface: string }) {
  const { user } = useAuth();

  return (
    <a
      href={pick.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => logAffiliateClick(pick, surface, user?.id)}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft transition-transform active:scale-[0.99]"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft/60 text-2xl">
        {pick.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink">{pick.title}</p>
          {pick.price ? (
            <span className="shrink-0 text-[11px] font-semibold text-ink-soft">
              {pick.price}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-soft">
          {pick.blurb}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
          {pick.vendor} · Ad
        </p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

export function AffiliateSection({
  title,
  picks,
  surface,
}: {
  title: string;
  picks: AffiliatePick[];
  surface: string;
}) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
        {title}
      </p>
      {picks.map((p) => (
        <AffiliateCard key={p.title} pick={p} surface={surface} />
      ))}
    </div>
  );
}
