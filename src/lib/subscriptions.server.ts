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
  const key = process.env.REVENUECAT_SECRET_API_KEY;
  if (!key) throw new Error("Subscription service is not configured");
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  if (response.status === 404) return false;
  if (!response.ok) throw new Error("Subscription service unavailable");
  const data = (await response.json()) as {
    subscriber?: { entitlements?: Record<string, Entitlement> };
  };
  if (!data.subscriber?.entitlements) throw new Error("Invalid subscription response");
  return entitlementIsActive(data.subscriber.entitlements.ai_chat);
}
