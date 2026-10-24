import { db } from "@/lib/db";
import { handler } from "@/lib/api";

function csvCell(value: unknown): string {
  const s = value === undefined || value === null ? "" : String(value);
  // Quote everything; neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export const GET = handler(
  async (req: Request) => {
    const origin = new URL(req.url).origin;
    const doctors = (await db.listDoctors()).sort((a, b) => a.name.localeCompare(b.name));
    const header = [
      "Name",
      "Invitation link",
      "Phone",
      "RSVP",
      "Guests",
      "RSVP phone",
      "Message",
      "Responded at",
      "First opened",
      "Times opened",
    ];
    const rows = doctors.map((d) => [
      `Dr. ${d.name}`,
      `${origin}/${d.slug}`,
      d.phone,
      d.rsvp ? (d.rsvp.status === "attending" ? "Attending" : "Declined") : "Pending",
      d.rsvp?.status === "attending" ? d.rsvp.guests : "",
      d.rsvp?.phone,
      d.rsvp?.message,
      d.rsvp?.respondedAt,
      d.firstOpenedAt,
      d.openCount,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    return new Response("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mycardiogen-rsvp-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  },
  { admin: true },
);
