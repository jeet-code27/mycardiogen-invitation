import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";

type Ctx = { params: Promise<{ slug: string }> };

export const DELETE = handler(
  async (_req: Request, { params }: Ctx) => {
    const { slug } = await params;
    if (!(await db.getDoctor(slug))) return jsonError("Not found", 404);
    await db.deleteDoctor(slug);
    return NextResponse.json({ ok: true });
  },
  { admin: true },
);

/** Clears the RSVP, updates the phone, or toggles Chief Guest. */
export const PATCH = handler(
  async (req: Request, { params }: Ctx) => {
    const { slug } = await params;
    const doctor = await db.getDoctor(slug);
    if (!doctor) return jsonError("Not found", 404);
    const body = (await req.json().catch(() => ({}))) as {
      resetRsvp?: boolean;
      phone?: string;
      chiefGuest?: boolean;
    };
    if (body.resetRsvp) delete doctor.rsvp;
    if (typeof body.chiefGuest === "boolean") doctor.chiefGuest = body.chiefGuest || undefined;
    if (typeof body.phone === "string") doctor.phone = body.phone.replace(/[^\d+]/g, "") || undefined;
    await db.putDoctor(doctor);
    return NextResponse.json({ doctor });
  },
  { admin: true },
);
