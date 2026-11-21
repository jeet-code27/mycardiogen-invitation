import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";
import { slugify } from "@/lib/slug";
import type { Doctor } from "@/lib/types";

const last10 = (phone?: string) => (phone ?? "").replace(/\D/g, "").slice(-10);

/**
 * RSVP from the short /reminder page (name + mobile). A guest who already has a personal
 * invitation is recognised by their mobile number, so their RSVP lands on that invitation
 * instead of creating a second entry. Anyone else gets an entry of their own.
 */
export const POST = handler(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    name?: string;
    phone?: string;
    status?: string;
  };
  if (body.status !== "attending" && body.status !== "declined") {
    return jsonError("Please choose whether you will attend.", 400);
  }
  const attending = body.status === "attending";
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!name) return jsonError("Please enter your name.", 400);
  const phone = String(body.phone ?? "").replace(/[^\d+\s-]/g, "").trim().slice(0, 20);
  const mobile = last10(phone);
  if (attending && mobile.length < 10) return jsonError("Please enter your 10-digit mobile number.", 400);
  if (phone && mobile.length < 10) return jsonError("That mobile number looks incomplete.", 400);

  const doctors = mobile ? await db.listDoctors() : [];
  let doctor: Doctor | null =
    // 1. Already invited personally under this number.
    (mobile && doctors.find((d) => !d.viaGeneral && last10(d.phone) === mobile)) ||
    // 2. Replied on this page (or the general invitation) before with this number.
    (mobile && doctors.find((d) => d.viaGeneral && last10(d.rsvp?.phone) === mobile)) ||
    null;
  if (!doctor && body.slug) {
    // 3. Replied from this browser before (e.g. a decline without a number).
    const previous = await db.getDoctor(String(body.slug));
    if (previous?.viaGeneral) doctor = previous;
  }
  if (!doctor) {
    doctor = {
      slug: `guest-${slugify(name, "")}-${randomBytes(3).toString("hex")}`,
      name,
      viaGeneral: true,
      via: "reminder",
      createdAt: new Date().toISOString(),
      openCount: 0,
    };
  } else if (doctor.viaGeneral) {
    doctor.name = name; // their own entry: keep the name as they typed it last
  }

  const previous = doctor.rsvp;
  doctor.rsvp = {
    status: body.status,
    // The page has no "+1" choice, so keep a +1 they gave on their invitation earlier.
    guests: attending ? (previous?.status === "attending" ? previous.guests : 1) : 0,
    phone: phone || previous?.phone,
    message: previous?.message,
    respondedAt: new Date().toISOString(),
    via: "reminder",
  };
  await db.putDoctor(doctor);
  // Never echo a personal invitation's details back to the page.
  return NextResponse.json({ slug: doctor.viaGeneral ? doctor.slug : undefined, status: doctor.rsvp.status });
});
