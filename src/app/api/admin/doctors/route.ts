import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";
import { cleanName, slugify } from "@/lib/slug";
import type { Doctor } from "@/lib/types";

const byNewest = (a: Doctor, b: Doctor) => b.createdAt.localeCompare(a.createdAt);

export const GET = handler(
  async () => NextResponse.json({ doctors: (await db.listDoctors()).sort(byNewest) }),
  { admin: true },
);

/** Body: { entries: { name: string; phone?: string }[] } */
export const POST = handler(
  async (req: Request) => {
    const body = (await req.json().catch(() => ({}))) as {
      entries?: { name?: string; phone?: string }[];
    };
    const entries = (body.entries ?? [])
      .map((e) => ({ name: cleanName(String(e.name ?? "")), phone: String(e.phone ?? "").trim() }))
      .filter((e) => e.name.length > 0);

    if (entries.length === 0) return jsonError("Please enter at least one doctor's name.", 400);
    if (entries.length > 500) return jsonError("Please add at most 500 doctors at a time.", 400);
    if (entries.some((e) => e.name.length > 80)) return jsonError("A name is too long.", 400);

    const taken = new Set((await db.listDoctors()).map((d) => d.slug));
    const created: Doctor[] = [];
    const now = Date.now();

    for (const [i, entry] of entries.entries()) {
      // Two different doctors can share a name; give the second one a numbered link.
      const base = slugify(entry.name);
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      taken.add(slug);

      const doctor: Doctor = {
        slug,
        name: entry.name,
        phone: entry.phone.replace(/[^\d+]/g, "") || undefined,
        // Offset by index so bulk-added rows keep their typed order when sorted by date.
        createdAt: new Date(now + i).toISOString(),
        openCount: 0,
      };
      await db.putDoctor(doctor);
      created.push(doctor);
    }

    return NextResponse.json({ created });
  },
  { admin: true },
);
