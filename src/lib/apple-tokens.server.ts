import { createHash } from "node:crypto";
import {
  createRemoteJWKSet,
  EncryptJWT,
  importPKCS8,
  jwtDecrypt,
  jwtVerify,
  SignJWT,
  type JWTVerifyGetKey,
} from "jose";

export const APPLE_CLIENTS = {
  ios: "com.parentlybabytracking.app",
  web: "com.parentlybabytracking.app.web",
} as const;
const issuer = "https://appleid.apple.com";
const appleKeys = createRemoteJWKSet(new URL(`${issuer}/auth/keys`));

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("Apple authorization is not configured. Please try again later.");
  return value;
}
function encryptionKey() {
  const key = Buffer.from(required("APPLE_TOKEN_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("Apple token encryption is not configured.");
  return key;
}
export async function sealAppleToken(refreshToken: string, userId: string, clientId: string) {
  return new EncryptJWT({ refreshToken, clientId })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuer("parently:apple-token-storage")
    .setSubject(userId)
    .setIssuedAt()
    .encrypt(encryptionKey());
}
export async function openAppleToken(encrypted: string, userId: string, clientId: string) {
  try {
    const { payload } = await jwtDecrypt(encrypted, encryptionKey(), {
      issuer: "parently:apple-token-storage",
      subject: userId,
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
    });
    if (
      payload.clientId !== clientId ||
      typeof payload.refreshToken !== "string" ||
      !payload.refreshToken
    )
      throw new Error("Apple token could not be validated.");
    return payload.refreshToken;
  } catch {
    throw new Error("Apple token could not be validated.");
  }
}
export async function verifyAppleIdentity(
  idToken: string,
  clientId: string,
  nonce: string,
  keys: JWTVerifyGetKey = appleKeys,
) {
  try {
    const { payload } = await jwtVerify(idToken, keys, {
      issuer,
      audience: clientId,
      algorithms: ["RS256"],
      requiredClaims: ["sub", "exp", "iat", "nonce"],
      maxTokenAge: "10m",
    });
    const hash = createHash("sha256").update(nonce).digest("hex");
    if (payload.nonce !== hash || !payload.sub)
      throw new Error("Apple sign-in could not be verified.");
    return payload.sub;
  } catch {
    throw new Error("Apple sign-in could not be verified.");
  }
}
async function clientSecret(clientId: string) {
  if (!Object.values(APPLE_CLIENTS).includes(clientId as typeof APPLE_CLIENTS.ios))
    throw new Error("Invalid Apple client.");
  const key = await importPKCS8(
    required("APPLE_SIGN_IN_PRIVATE_KEY").replace(/\\n/g, "\n"),
    "ES256",
  );
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: required("APPLE_SIGN_IN_KEY_ID") })
    .setIssuer(required("APPLE_SIGN_IN_TEAM_ID"))
    .setSubject(clientId)
    .setAudience(issuer)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}
export async function exchangeAppleCode(
  code: string,
  clientId: string,
  fetcher: typeof fetch = fetch,
) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: await clientSecret(clientId),
    grant_type: "authorization_code",
    code,
  });
  if (clientId === APPLE_CLIENTS.web) body.set("redirect_uri", required("APPLE_WEB_REDIRECT_URI"));
  const response = await fetcher(`${issuer}/auth/token`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error("Apple sign-in expired or could not be completed. Please sign in again.");
  const result = await response.json();
  if (
    typeof result.refresh_token !== "string" ||
    !result.refresh_token ||
    typeof result.id_token !== "string"
  )
    throw new Error("Apple did not return a usable authorization.");
  return { refreshToken: result.refresh_token as string, idToken: result.id_token as string };
}
export async function revokeAppleToken(
  refreshToken: string,
  clientId: string,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(`${issuer}/auth/revoke`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: await clientSecret(clientId),
      token: refreshToken,
      token_type_hint: "refresh_token",
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error("Apple authorization could not be revoked. Please retry deletion.");
}
