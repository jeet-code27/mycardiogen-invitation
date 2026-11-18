import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";
import { isGroupId } from "@/lib/groups";
import { TITLES, parseGuest } from "@/lib/slug";

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

/**
 * Edits a guest: name / title / phone, Chief Guest, "sent", contact list, or clears the RSVP.
 * The link (slug) never changes, so invitations already sent keep working.
 */
export const PATCH = handler(
  async (req: Request, { params }: Ctx) => {
    const { slug } = await params;
    const doctor = await db.getDoctor(slug);
    if (!doctor) return jsonError("Not found", 404);
    const body = (await req.json().catch(() => ({}))) as {
      resetRsvp?: boolean;
      phone?: string;
      chiefGuest?: boolean;
      sent?: boolean;
      group?: string;
      name?: string;
      title?: string;
    };
    if (typeof body.name === "string") {
      if (doctor.viaGeneral) {
        // General-link guests keep the name exactly as written.
        const name = body.name.replace(/\s+/g, " ").trim();
        if (!name) return jsonError("Please enter a name.", 400);
        doctor.name = name.slice(0, 80);
      } else {
        const fallback = (TITLES as readonly string[]).includes(String(body.title))
          ? String(body.title)
          : (doctor.title ?? "Dr.");
        const { title, name } = parseGuest(body.name, fallback);
        if (!name) return jsonError("Please enter a name.", 400);
        if (name.length > 80) return jsonError("The name is too long.", 400);
        doctor.name = name;
        doctor.title = title === "Dr." ? undefined : title;
      }
    }
    if (body.resetRsvp) delete doctor.rsvp;
    if (typeof body.chiefGuest === "boolean") doctor.chiefGuest = body.chiefGuest || undefined;
    if (typeof body.sent === "boolean") doctor.sentAt = body.sent ? new Date().toISOString() : undefined;
    if (isGroupId(body.group)) doctor.group = body.group === "ravinder" ? "ravinder" : undefined;
    if (typeof body.phone === "string") doctor.phone = body.phone.replace(/[^\d+]/g, "") || undefined;
    await db.putDoctor(doctor);
    return NextResponse.json({ doctor });
  },
  { admin: true },
);
