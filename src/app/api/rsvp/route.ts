import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";
import { slugify } from "@/lib/slug";
import type { Doctor } from "@/lib/types";

/**
 * RSVP from a personal invitation (`slug`), or from the general home-page invitation (`name`,
 * plus the `slug` it was given last time so a changed reply updates the same entry).
 */
export const POST = handler(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    name?: string;
    status?: string;
    guests?: number;
    phone?: string;
    message?: string;
  };
  if (body.status !== "attending" && body.status !== "declined") {
    return jsonError("Please choose whether you will attend.", 400);
  }
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80);

  let doctor: Doctor | null = body.slug ? await db.getDoctor(String(body.slug)) : null;
  if (doctor && !doctor.viaGeneral && name) doctor = null; // never let a general reply touch a personal invite
  if (!doctor) {
    if (!name) return jsonError(body.slug ? "Invitation not found." : "Please enter your name.", body.slug ? 404 : 400);
    const base = slugify(name).replace(/^dr-/, "");
    doctor = {
      slug: `guest-${base}-${randomBytes(3).toString("hex")}`,
      name,
      viaGeneral: true,
      createdAt: new Date().toISOString(),
      openCount: 0,
    };
  } else if (doctor.viaGeneral && name) {
    doctor.name = name;
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
  return NextResponse.json({
    slug: doctor.viaGeneral ? doctor.slug : undefined,
    rsvp: { status: doctor.rsvp.status, guests: doctor.rsvp.guests },
  });
});
