import { NextResponse } from "next/server";
import { checkCredentials, createSession, credentialsConfigured } from "@/lib/auth";
import { handler, jsonError } from "@/lib/api";

export const POST = handler(async (req: Request) => {
  if (!credentialsConfigured()) {
    return jsonError("Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.", 503);
  }
  const body = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  if (!checkCredentials(String(body.username ?? ""), String(body.password ?? ""))) {
    // Small fixed delay to blunt brute-force attempts.
    await new Promise((r) => setTimeout(r, 600));
    return jsonError("Incorrect ID or password.", 401);
  }
  await createSession();
  return NextResponse.json({ ok: true });
});
