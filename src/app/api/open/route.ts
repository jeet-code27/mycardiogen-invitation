import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler } from "@/lib/api";

/** Records that a doctor opened their invitation (sent when they break the seal). */
export const POST = handler(async (req: Request) => {
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  const doctor = await db.getDoctor(String(slug ?? ""));
  if (!doctor) return NextResponse.json({ ok: false });
  const now = new Date().toISOString();
  doctor.firstOpenedAt ??= now;
  doctor.lastOpenedAt = now;
  doctor.openCount = (doctor.openCount ?? 0) + 1;
  await db.putDoctor(doctor);
  return NextResponse.json({ ok: true });
});
