import { Capacitor } from "@capacitor/core";

// Product identifiers — must match App Store Connect + Google Play Console listings.
export const AI_CHAT_MONTHLY_PRODUCT_ID = "parently_ai_chat_monthly";
export const AI_CHAT_ENTITLEMENT_ID = "ai_chat";

// RevenueCat public API keys (safe to embed in the app binary — RevenueCat design).
// Add real values once the RevenueCat project is created.
const REVENUECAT_APPLE_KEY = import.meta.env.VITE_REVENUECAT_APPLE_API_KEY ?? "";
const REVENUECAT_GOOGLE_KEY = import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY ?? "";

type PurchasesModule = typeof import("@revenuecat/purchases-capacitor");

let purchasesPromise: Promise<PurchasesModule | null> | null = null;

async function loadPurchases(): Promise<PurchasesModule | null> {
  if (!Capacitor.isNativePlatform()) return null;
  if (!purchasesPromise) {
    purchasesPromise = import("@revenuecat/purchases-capacitor")
      .then(async (mod) => {
        const key =
          Capacitor.getPlatform() === "ios" ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;
        if (!key || key.includes("PLACEHOLDER"))
          throw new Error("Subscriptions are temporarily unavailable. Please try again later.");
        await mod.Purchases.configure({ apiKey: key });
        return mod;
      })
      .catch((error) => {
        purchasesPromise = null;
        throw error;
      });
  }
  return purchasesPromise;
}

export async function identifyUser(userId: string): Promise<void> {
  const mod = await loadPurchases();
  if (!mod) return;
  await mod.Purchases.logIn({ appUserID: userId });
}

export async function getAiChatProduct() {
  const mod = await loadPurchases();
  if (!mod) return null;
  const offerings = await mod.Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(
    (p) => p.product.identifier === AI_CHAT_MONTHLY_PRODUCT_ID,
  );
  if (!pkg) throw new Error("Subscription not available. Please try again later.");
  return pkg.product;
}

export async function hasAiChatEntitlement(): Promise<boolean> {
  const mod = await loadPurchases();
  if (!mod) return false;
  const info = await mod.Purchases.getCustomerInfo();
  return Boolean(info.customerInfo.entitlements.active[AI_CHAT_ENTITLEMENT_ID]);
}

export type PurchaseResult =
  | { status: "unavailable" }
  | { status: "cancelled" }
  | { status: "error"; message: string }
  | { status: "success"; entitled: boolean };

export async function startAiChatTrial(): Promise<PurchaseResult> {
  try {
    const mod = await loadPurchases();
    if (!mod) return { status: "unavailable" };
    const offerings = await mod.Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === AI_CHAT_MONTHLY_PRODUCT_ID,
    );
    if (!pkg) return { status: "error", message: "Subscription not available." };

    const { customerInfo } = await mod.Purchases.purchasePackage({ aPackage: pkg });
    return {
      status: "success",
      entitled: Boolean(customerInfo.entitlements.active[AI_CHAT_ENTITLEMENT_ID]),
    };
  } catch (err) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e.userCancelled) return { status: "cancelled" };
    return { status: "error", message: e.message ?? "Purchase failed." };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    const mod = await loadPurchases();
    if (!mod) return { status: "unavailable" };
    const { customerInfo } = await mod.Purchases.restorePurchases();
    return {
      status: "success",
      entitled: Boolean(customerInfo.entitlements.active[AI_CHAT_ENTITLEMENT_ID]),
    };
  } catch (err) {
    const e = err as { message?: string };
    return { status: "error", message: e.message ?? "Restore failed." };
  }
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}
