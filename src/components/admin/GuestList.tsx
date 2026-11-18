"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Download,
  ExternalLink,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type { Doctor, Settings } from "@/lib/types";
import { displayName } from "@/lib/slug";
import { GROUPS, type GroupId, groupOf } from "@/lib/groups";
import { templateFor } from "@/lib/whatsapp";
import { card, ghostBtn, iconBtn, useToast } from "./ui";
import { copyText, inviteLink, whatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

type Filter = "all" | "attending" | "declined" | "awaiting" | "unopened" | "general";
type SentFilter = "all" | "sent" | "unsent";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["attending", "Attending"],
  ["declined", "Declined"],
  ["awaiting", "Awaiting reply"],
  ["unopened", "Not opened"],
  ["general", "General link"],
];

const PAGE_SIZE = 25;

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
  if (d.firstOpenedAt || d.viaGeneral)
    return <span className="rounded-full bg-[#ffe7cd] px-3 py-1 text-xs font-bold text-[#a3520c]">Opened</span>;
  return <span className="rounded-full bg-blush/60 px-3 py-1 text-xs font-bold text-blood">Not opened</span>;
}

/** A row of small toggle chips. */
function Chips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {label && <span className="text-xs font-bold tracking-wide text-cocoa/45 uppercase">{label}</span>}
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            value === v ? "bg-cocoa text-cream" : "bg-cocoa/5 text-cocoa/60 hover:text-cocoa"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default function GuestList({
  doctors,
  origin,
  settings,
  onChange,
  onRemove,
}: {
  doctors: Doctor[];
  origin: string;
  settings: Pick<Settings, "whatsappMessage" | "whatsappMessageRavinder">;
  onChange: (d: Doctor) => void;
  onRemove: (slug: string) => void;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [group, setGroup] = useState<"all" | GroupId>("all");
  const [sent, setSent] = useState<SentFilter>("all");
  const [page, setPage] = useState(1);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.slug.includes(q)) return false;
      // General-link guests replied on their own; they belong to no contact list and need no sending.
      if (group !== "all" && (d.viaGeneral || groupOf(d) !== group)) return false;
      if (sent === "sent" && !d.sentAt) return false;
      if (sent === "unsent" && (d.sentAt || d.viaGeneral)) return false;
      if (filter === "attending") return d.rsvp?.status === "attending";
      if (filter === "declined") return d.rsvp?.status === "declined";
      if (filter === "awaiting") return !d.rsvp;
      if (filter === "unopened") return !d.firstOpenedAt && !d.viaGeneral;
      if (filter === "general") return d.viaGeneral;
      return true;
    });
  }, [doctors, query, filter, group, sent]);

  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageItems = shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const personal = doctors.filter((d) => !d.viaGeneral);
  const sentCount = personal.filter((d) => d.sentAt).length;

  // Any change to what's listed starts again from the first page.
  function reset<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setPage(1);
    };
  }

  async function patch(d: Doctor, body: object, ok: string, fail = "Could not update") {
    const res = await fetch(`/api/admin/doctors/${d.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onChange((await res.json()).doctor);
      if (ok) toast(ok);
    } else toast(fail, "error");
  }

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
    if (!confirm(`Delete ${displayName(d)}? ${d.viaGeneral ? "Their RSVP will be removed." : "Their link will stop working."}`)) return;
    const res = await fetch(`/api/admin/doctors/${d.slug}`, { method: "DELETE" });
    if (res.ok) {
      onRemove(d.slug);
      toast("Invitation deleted");
    } else toast("Could not delete", "error");
  }

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex flex-col gap-4 border-b border-cocoa/10 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl">Guest list</h2>
          <p className="mt-1 text-sm text-cocoa/60">
            {doctors.length} invitation{doctors.length === 1 ? "" : "s"} ·{" "}
            <span className="font-bold text-[#128C4B]">
              {sentCount} of {personal.length} sent on WhatsApp
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-cocoa/40" />
            <input
              value={query}
              onChange={(e) => reset(setQuery)(e.target.value)}
              placeholder="Search guests"
              className="w-full rounded-full border border-cocoa/15 bg-white py-2 pr-4 pl-10 text-sm focus:border-teal focus:ring-4 focus:ring-teal/15 focus:outline-none sm:w-56"
            />
          </label>
          <button type="button" onClick={exportCsv} className={ghostBtn}>
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pt-5 sm:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chips value={filter} options={FILTERS} onChange={reset(setFilter)} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 overflow-x-auto pb-1">
          <Chips
            label="List"
            value={group}
            options={[["all", "All"], ...GROUPS.map((g) => [g.id, g.short] as [GroupId, string])]}
            onChange={reset(setGroup)}
          />
          <Chips
            label="WhatsApp"
            value={sent}
            options={[
              ["all", "All"],
              ["unsent", "Not sent"],
              ["sent", "Sent"],
            ]}
            onChange={reset(setSent)}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="px-8 py-16 text-center text-cocoa/50">
          {doctors.length === 0 ? "No invitations yet. Add your first guest above." : "No guests match."}
        </p>
      ) : (
        <ul className="divide-y divide-cocoa/8 p-2 sm:p-4">
          {pageItems.map((d) => {
            const link = inviteLink(origin, d.slug);
            const g = groupOf(d);
            return (
              <li
                key={d.slug}
                className="grid gap-3 rounded-2xl p-4 transition-colors hover:bg-cocoa/[0.03] md:grid-cols-[1fr_auto_auto] md:items-center md:gap-6"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-serif text-lg">
                    {displayName(d)}
                    {d.viaGeneral && (
                      <span className="rounded-full bg-teal/10 px-2.5 py-0.5 font-sans text-[11px] font-bold text-teal">
                        General link
                      </span>
                    )}
                    {d.chiefGuest && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1d6] px-2.5 py-0.5 font-sans text-[11px] font-bold text-[#8a5300]">
                        <Crown className="size-3" /> Chief Guest
                      </span>
                    )}
                  </p>
                  {!d.viaGeneral && (
                    <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-cocoa/50">
                      <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
                      <select
                        value={g}
                        onChange={(e) =>
                          patch(d, { group: e.target.value }, `Moved to ${GROUPS.find((x) => x.id === e.target.value)?.label}`)
                        }
                        aria-label="Contact list"
                        title="Contact list"
                        className="cursor-pointer rounded-full border border-cocoa/10 bg-cocoa/[0.04] px-2 py-0.5 font-sans text-[11px] font-bold text-cocoa/70 focus:outline-none"
                      >
                        {GROUPS.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.short}
                          </option>
                        ))}
                      </select>
                    </p>
                  )}
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
                <div className="flex flex-wrap items-center gap-0.5">
                  {!d.viaGeneral && (
                    <>
                      <button
                        type="button"
                        onClick={() => patch(d, { sent: !d.sentAt }, d.sentAt ? "Marked as not sent" : "Marked as sent")}
                        title={d.sentAt ? `Sent ${when.format(new Date(d.sentAt))} · click to undo` : "Tick once the invitation is sent"}
                        aria-pressed={Boolean(d.sentAt)}
                        className={`mr-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                          d.sentAt
                            ? "border-[#25D366] bg-[#25D366] text-white"
                            : "border-cocoa/15 bg-white text-cocoa/55 hover:border-[#25D366] hover:text-[#128C4B]"
                        }`}
                      >
                        <span
                          className={`grid size-3.5 place-items-center rounded-[4px] border ${
                            d.sentAt ? "border-white bg-white text-[#25D366]" : "border-cocoa/30"
                          }`}
                        >
                          {d.sentAt && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        {d.sentAt ? "Sent" : "Not sent"}
                      </button>
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
                        title={`Send on WhatsApp (${GROUPS.find((x) => x.id === g)?.short}'s message)`}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={whatsappUrl(d.phone, whatsappMessage(templateFor(settings, g), displayName(d), link))}
                      >
                        <WhatsAppIcon className="size-4 text-[#25D366]" />
                      </a>
                      <a className={iconBtn} title="Open invitation" target="_blank" rel="noopener noreferrer" href={`/${d.slug}`}>
                        <ExternalLink className="size-4" />
                      </a>
                      <button
                        type="button"
                        className={`${iconBtn} ${d.chiefGuest ? "text-[#c98a1c] hover:text-[#8a5300]" : ""}`}
                        title={d.chiefGuest ? "Remove Chief Guest" : "Make Chief Guest"}
                        onClick={() =>
                          patch(d, { chiefGuest: !d.chiefGuest }, d.chiefGuest ? "Removed Chief Guest" : `${displayName(d)} is now Chief Guest`)
                        }
                      >
                        <Crown className={`size-4 ${d.chiefGuest ? "fill-current" : ""}`} />
                      </button>
                    </>
                  )}
                  {d.rsvp && (
                    <button
                      type="button"
                      className={iconBtn}
                      title="Clear RSVP"
                      onClick={() => {
                        if (confirm(`Clear ${displayName(d)}'s RSVP so they can respond again?`)) {
                          patch(d, { resetRsvp: true }, "RSVP cleared", "Could not clear RSVP");
                        }
                      }}
                    >
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

      {shown.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cocoa/10 px-6 py-4 text-sm sm:px-8">
          <span className="text-cocoa/55">
            Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, shown.length)} of {shown.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={ghostBtn}
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" /> Prev
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === current ? "page" : undefined}
                className={`grid size-9 cursor-pointer place-items-center rounded-full text-sm font-bold transition-colors ${
                  n === current ? "bg-cocoa text-cream" : "text-cocoa/60 hover:bg-cocoa/5 hover:text-cocoa"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className={ghostBtn}
              disabled={current === pageCount}
              onClick={() => setPage(current + 1)}
              aria-label="Next page"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
