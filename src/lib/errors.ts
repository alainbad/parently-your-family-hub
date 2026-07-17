/**
 * Supabase's PostgrestError/AuthError shapes aren't always real Error
 * instances (postgrest-js in particular returns a plain object with a
 * `message` string), so `err instanceof Error` silently misses them.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return fallback;
}
