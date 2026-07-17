import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { AffiliateSection } from "@/components/AffiliateCard";
import { SHOP_SECTIONS } from "@/lib/affiliate-picks";

export const Route = createFileRoute("/shop")({
  component: ShopScreen,
});

function ShopScreen() {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Shop"
        title="Everything in one place"
        subtitle="Picks from your journey, home, and tracking screens"
      />

      <div className="px-6">
        {SHOP_SECTIONS.every((s) => s.picks.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-center">
            <ShoppingBag className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-sm font-semibold text-ink">Nothing here yet</p>
          </div>
        ) : (
          SHOP_SECTIONS.filter((s) => s.picks.length > 0).map((section) => (
            <AffiliateSection
              key={section.id}
              title={section.title}
              picks={section.picks}
              surface="shop"
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
