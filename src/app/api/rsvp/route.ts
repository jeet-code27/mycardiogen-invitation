import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";

export const POST = handler(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    status?: string;
    guests?: number;
    phone?: string;
    message?: string;
  };
  const doctor = await db.getDoctor(String(body.slug ?? ""));
  if (!doctor) return jsonError("Invitation not found.", 404);
  if (body.status !== "attending" && body.status !== "declined") {
    return jsonError("Please choose whether you will attend.", 400);
  }

  const attending = body.status === "attending";
  doctor.rsvp = {
    status: body.status,
    guests: attending ? Math.min(Math.max(Number(body.guests) || 1, 1), 2) : 0,
    phone: String(body.phone ?? "").replace(/[^\d+\s-]/g, "").trim().slice(0, 20) || undefined,
    message: String(body.message ?? "").trim().slice(0, 500) || undefined,
    respondedAt: new Date().toISOString(),
  };
  await db.putDoctor(doctor);
  return NextResponse.json({ rsvp: { status: doctor.rsvp.status, guests: doctor.rsvp.guests } });
});
