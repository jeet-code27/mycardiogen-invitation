"use client";

import { useMemo, useState } from "react";
import { Copy, Download, ExternalLink, RotateCcw, Search, Trash2 } from "lucide-react";
import type { Doctor } from "@/lib/types";
import { card, ghostBtn, iconBtn, useToast } from "./ui";
import { copyText, inviteLink, whatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

type Filter = "all" | "attending" | "declined" | "awaiting" | "unopened";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["attending", "Attending"],
  ["declined", "Declined"],
  ["awaiting", "Awaiting reply"],
  ["unopened", "Not opened"],
];

const when = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

function StatusBadge({ d }: { d: Doctor }) {
  if (d.rsvp?.status === "attending")
    return (
      <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
        Attending{d.rsvp.guests > 1 ? " +1" : ""}
      </span>
    );
  if (d.rsvp?.status === "declined")
    return <span className="rounded-full bg-cocoa/8 px-3 py-1 text-xs font-bold text-cocoa/60">Declined</span>;
  if (d.firstOpenedAt)
    return <span className="rounded-full bg-[#ffe7cd] px-3 py-1 text-xs font-bold text-[#a3520c]">Opened</span>;
  return <span className="rounded-full bg-blush/60 px-3 py-1 text-xs font-bold text-blood">Not opened</span>;
}

export default function GuestList({
  doctors,
  origin,
  onChange,
  onRemove,
}: {
  doctors: Doctor[];
  origin: string;
  onChange: (d: Doctor) => void;
  onRemove: (slug: string) => void;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.slug.includes(q)) return false;
      if (filter === "attending") return d.rsvp?.status === "attending";
      if (filter === "declined") return d.rsvp?.status === "declined";
      if (filter === "awaiting") return !d.rsvp;
      if (filter === "unopened") return !d.firstOpenedAt;
      return true;
    });
  }, [doctors, query, filter]);

  async function exportCsv() {
    const res = await fetch("/api/admin/export");
    if (!res.ok) return toast("Could not export", "error");
    const name =
      res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "mycardiogen-rsvp.csv";
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function remove(d: Doctor) {
    if (!confirm(`Delete the invitation for Dr. ${d.name}? Their link will stop working.`)) return;
    const res = await fetch(`/api/admin/doctors/${d.slug}`, { method: "DELETE" });
    if (res.ok) {
      onRemove(d.slug);
      toast("Invitation deleted");
    } else toast("Could not delete", "error");
  }

  async function resetRsvp(d: Doctor) {
    if (!confirm(`Clear Dr. ${d.name}'s RSVP so they can respond again?`)) return;
    const res = await fetch(`/api/admin/doctors/${d.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetRsvp: true }),
    });
    if (res.ok) {
      onChange((await res.json()).doctor);
      toast("RSVP cleared");
    } else toast("Could not clear RSVP", "error");
  }

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex flex-col gap-4 border-b border-cocoa/10 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl">Guest list</h2>
          <p className="mt-1 text-sm text-cocoa/60">
            {doctors.length} invitation{doctors.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cocoa/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors"
              className="w-full rounded-full border border-cocoa/15 bg-white py-2 pr-4 pl-10 text-sm focus:border-teal focus:ring-4 focus:ring-teal/15 focus:outline-none sm:w-56"
            />
          </label>
          <button type="button" onClick={exportCsv} className={ghostBtn}>
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-6 pt-5 sm:px-8">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              filter === value ? "bg-cocoa text-cream" : "bg-cocoa/5 text-cocoa/60 hover:text-cocoa"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="px-8 py-16 text-center text-cocoa/50">
          {doctors.length === 0 ? "No invitations yet. Add your first doctor above." : "No doctors match."}
        </p>
      ) : (
        <ul className="divide-y divide-cocoa/8 p-2 sm:p-4">
          {shown.map((d) => {
            const link = inviteLink(origin, d.slug);
            return (
              <li
                key={d.slug}
                className="grid gap-3 rounded-2xl p-4 transition-colors hover:bg-cocoa/[0.03] md:grid-cols-[1fr_auto_auto] md:items-center md:gap-6"
              >
                <div className="min-w-0">
                  <p className="font-serif text-lg">Dr. {d.name}</p>
                  <p className="truncate font-mono text-xs text-cocoa/50">{link.replace(/^https?:\/\//, "")}</p>
                  {(d.rsvp?.message || d.rsvp?.phone) && (
                    <p className="mt-1.5 text-sm text-cocoa/70">
                      {d.rsvp.phone && <span className="mr-2 font-bold">{d.rsvp.phone}</span>}
                      {d.rsvp.message && <span className="italic">“{d.rsvp.message}”</span>}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1">
                  <StatusBadge d={d} />
                  <span className="text-xs text-cocoa/45">
                    {d.rsvp
                      ? `Replied ${when.format(new Date(d.rsvp.respondedAt))}`
                      : d.lastOpenedAt
                        ? `Seen ${when.format(new Date(d.lastOpenedAt))}`
                        : `Added ${when.format(new Date(d.createdAt))}`}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    className={iconBtn}
                    title="Copy link"
                    onClick={async () => {
                      if (await copyText(link)) toast("Link copied");
                    }}
                  >
                    <Copy className="size-4" />
                  </button>
                  <a
                    className={iconBtn}
                    title="Send on WhatsApp"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={whatsappUrl(d.phone, whatsappMessage(d.name, link))}
                  >
                    <WhatsAppIcon className="size-4 text-[#25D366]" />
                  </a>
                  <a className={iconBtn} title="Open invitation" target="_blank" rel="noopener noreferrer" href={`/${d.slug}`}>
                    <ExternalLink className="size-4" />
                  </a>
                  {d.rsvp && (
                    <button type="button" className={iconBtn} title="Clear RSVP" onClick={() => resetRsvp(d)}>
                      <RotateCcw className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${iconBtn} hover:bg-ember/10 hover:text-ember`}
                    title="Delete invitation"
                    onClick={() => remove(d)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
