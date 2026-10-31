type Entitlement = { expires_date?: string | null; grace_period_expires_date?: string | null };

export function entitlementIsActive(
  entitlement: Entitlement | undefined,
  now = Date.now(),
): boolean {
  if (!entitlement) return false;
  if (entitlement.expires_date === null) return true;
  return [entitlement.expires_date, entitlement.grace_period_expires_date].some(
    (date) => typeof date === "string" && Date.parse(date) > now,
  );
}

export async function userHasAiSubscription(userId: string): Promise<boolean> {
  // Customer-info GET supports the same public app key used by the native SDK.
  // Keep verification on the server; no client-supplied entitlement is trusted.
  // A privileged secret is unnecessary for this lookup.
  const key =
    process.env.REVENUECAT_APPLE_API_KEY?.trim() ||
    process.env.VITE_REVENUECAT_APPLE_API_KEY?.trim() ||
    "appl_sLGVNLgmhcPlAACtpjAYXYZRLWP";
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  if (response.status === 404) return false;
  if (!response.ok) {
    // Report only the status, never credentials, subscriber IDs or response bodies.
    console.error(
      `Subscription verification (app-key): RevenueCat returned HTTP ${response.status}`,
    );
    throw new Error("Subscription service unavailable");
  }
  const data = (await response.json()) as {
    subscriber?: { entitlements?: Record<string, Entitlement> };
  };
  if (!data.subscriber?.entitlements) throw new Error("Invalid subscription response");
  return entitlementIsActive(data.subscriber.entitlements.ai_chat);
}

// Server verification uses live RevenueCat customer info.
