import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "cg_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function credentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  const secret = process.env.SESSION_SECRET || `${username}:${password}:mycardiogen`;
  return { username, password, secret };
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function checkCredentials(username: string, password: string): boolean {
  const c = credentials();
  if (!c) return false;
  // Evaluate both so timing doesn't reveal which field was wrong.
  const userOk = safeEqual(username.trim(), c.username);
  const passOk = safeEqual(password, c.password);
  return userOk && passOk;
}

export function credentialsConfigured(): boolean {
  return credentials() !== null;
}

export async function createSession(): Promise<void> {
  const c = credentials();
  if (!c) throw new Error("Admin credentials are not configured");
  const payload = Buffer.from(
    JSON.stringify({ u: c.username, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, c.secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const c = credentials();
  if (!c) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, c.secret))) return false;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      u: string;
      exp: number;
    };
    return u === c.username && exp > Date.now();
  } catch {
    return false;
  }
}
