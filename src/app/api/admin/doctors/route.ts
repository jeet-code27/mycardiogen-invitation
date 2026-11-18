import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handler, jsonError } from "@/lib/api";
import { TITLES, parseGuest, slugify } from "@/lib/slug";
import { isGroupId } from "@/lib/groups";
import type { Doctor } from "@/lib/types";

const byNewest = (a: Doctor, b: Doctor) => b.createdAt.localeCompare(a.createdAt);

export const GET = handler(
  async () => NextResponse.json({ doctors: (await db.listDoctors()).sort(byNewest) }),
  { admin: true },
);

/**
 * Body: { entries: { name, phone?, chiefGuest?, defaultTitle? }[] }. A title typed in the name
 * ("Mr. Bipin Gupta") wins; otherwise `defaultTitle` (one of TITLES) applies, else "Dr.".
 */
export const POST = handler(
  async (req: Request) => {
    const body = (await req.json().catch(() => ({}))) as {
      entries?: { name?: string; phone?: string; chiefGuest?: boolean; defaultTitle?: string; group?: string }[];
    };
    const entries = (body.entries ?? [])
      .map((e) => {
        const fallback = (TITLES as readonly string[]).includes(String(e.defaultTitle))
          ? String(e.defaultTitle)
          : "Dr.";
        return {
          ...parseGuest(String(e.name ?? ""), fallback),
          phone: String(e.phone ?? "").trim(),
          chiefGuest: e.chiefGuest === true,
          group: isGroupId(e.group) ? e.group : "anand",
        };
      })
      .filter((e) => e.name.length > 0);

    if (entries.length === 0) return jsonError("Please enter at least one doctor's name.", 400);
    if (entries.length > 500) return jsonError("Please add at most 500 doctors at a time.", 400);
    if (entries.some((e) => e.name.length > 80)) return jsonError("A name is too long.", 400);

    const taken = new Set((await db.listDoctors()).map((d) => d.slug));
    const created: Doctor[] = [];
    const now = Date.now();

    for (const [i, entry] of entries.entries()) {
      // Two different doctors can share a name; give the second one a numbered link.
      const base = slugify(entry.name, entry.title);
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      taken.add(slug);

      const doctor: Doctor = {
        slug,
        name: entry.name,
        // Stored only when it isn't "Dr.", so older records and new doctors look the same.
        title: entry.title === "Dr." ? undefined : entry.title,
        phone: entry.phone.replace(/[^\d+]/g, "") || undefined,
        chiefGuest: entry.chiefGuest || undefined,
        group: entry.group === "ravinder" ? "ravinder" : undefined,
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
