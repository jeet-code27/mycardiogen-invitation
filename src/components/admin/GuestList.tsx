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
  Pencil,
  Trash2,
} from "lucide-react";
import type { Doctor, Settings } from "@/lib/types";
import { TITLES, cleanName, displayName } from "@/lib/slug";
import { allGroups, groupLabel, groupOf, groupShort } from "@/lib/groups";
import { templateFor } from "@/lib/whatsapp";
import { card, ghostBtn, iconBtn, input, primaryBtn, useToast } from "./ui";
import { copyText, inviteLink, whatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

type Filter = "all" | "attending" | "declined" | "awaiting" | "unopened" | "general";
type SentFilter = "all" | "sent" | "unsent";
type Sort = "az" | "newest";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["attending", "Attending"],
  ["declined", "Declined"],
  ["awaiting", "Awaiting reply"],
  ["unopened", "Not opened"],
  ["general", "General link"],
];

const PAGE_SIZE = 25;
/** Row list-picker value that asks for a new category name. */
const OTHER = "__other__";

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

/** Inline editor for a guest's title, name and WhatsApp number. The link never changes. */
function EditGuest({
  d,
  onSave,
  onCancel,
}: {
  d: Doctor;
  onSave: (body: { name: string; title?: string; phone: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(d.title ?? "Dr.");
  const [name, setName] = useState(d.name);
  const [phone, setPhone] = useState(d.phone ?? "");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="rounded-2xl border border-teal/25 bg-teal/5 p-4 lg:col-span-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSave(d.viaGeneral ? { name, phone } : { name, title, phone });
        setBusy(false);
      }}
    >
      <div className={`grid gap-3 ${d.viaGeneral ? "sm:grid-cols-[1fr_220px]" : "sm:grid-cols-[110px_1fr_220px]"}`}>
        {!d.viaGeneral && (
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
            className={`${input} cursor-pointer font-serif`}
          >
            {TITLES.map((t) => (
              <option key={t} value={t}>
                {t || "No title"}
              </option>
            ))}
          </select>
        )}
        <input
          className={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Name"
          placeholder="Name"
          required
          maxLength={80}
          autoFocus
        />
        <input
          className={input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-label="WhatsApp number"
          placeholder="WhatsApp no. e.g. 9876543210"
          inputMode="tel"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !name.trim()} className={primaryBtn}>
          Save
        </button>
        <button type="button" onClick={onCancel} className={ghostBtn}>
          Cancel
        </button>
        {!d.viaGeneral && (
          <span className="text-xs text-cocoa/50">The invitation link stays the same, so links already sent keep working.</span>
        )}
      </div>
    </form>
  );
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
    // On phones each row scrolls sideways (edge to edge) instead of spilling off the screen.
    <div className="-mx-5 flex min-w-0 items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      {label && <span className="shrink-0 text-xs font-bold tracking-wide text-cocoa/45 uppercase">{label}</span>}
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

/** The "sent on WhatsApp" tick. The caller sets its display (it sits in a different spot on phones). */
function SentToggle({ d, onToggle, className }: { d: Doctor; onToggle: () => void; className: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={d.sentAt ? `Sent ${when.format(new Date(d.sentAt))} · click to undo` : "Tick once the invitation is sent"}
      aria-pressed={Boolean(d.sentAt)}
      className={`w-[92px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border py-1.5 text-xs font-bold transition-colors ${
        d.sentAt
          ? "border-[#25D366] bg-[#25D366] text-white"
          : "border-cocoa/15 bg-white text-cocoa/55 hover:border-[#25D366] hover:text-[#128C4B]"
      } ${className}`}
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
  const [group, setGroup] = useState("all");
  const groups = useMemo(() => allGroups(doctors), [doctors]);
  const [sent, setSent] = useState<SentFilter>("all");
  const [sort, setSort] = useState<Sort>("az");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matching = doctors.filter((d) => {
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
    // A–Z goes by the name itself, so "Dr." / "Mr." don't bunch everyone under D and M.
    const byName = new Intl.Collator("en", { sensitivity: "base", numeric: true });
    return sort === "az"
      ? matching.sort((a, b) => byName.compare(cleanName(a.name), cleanName(b.name)))
      : matching.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [doctors, query, filter, group, sent, sort]);

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

  async function patch(d: Doctor, body: object, ok: string, fail = "Could not update"): Promise<boolean> {
    const res = await fetch(`/api/admin/doctors/${d.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onChange((await res.json()).doctor);
      if (ok) toast(ok);
      return true;
    }
    const msg = (await res.json().catch(() => ({}))).error;
    toast(msg || fail, "error");
    return false;
  }

  function toggleSent(d: Doctor) {
    patch(d, { sent: !d.sentAt }, d.sentAt ? "Marked as not sent" : "Marked as sent");
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
      <div className="flex flex-col gap-4 border-b border-cocoa/10 p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
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
              className="w-full rounded-full border border-cocoa/15 bg-white py-2 pr-4 pl-10 text-base focus:border-teal sm:text-sm focus:ring-4 focus:ring-teal/15 focus:outline-none sm:w-56"
            />
          </label>
          <button type="button" onClick={exportCsv} className={ghostBtn}>
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-5 sm:px-8">
        <Chips value={filter} options={FILTERS} onChange={reset(setFilter)} />
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:gap-x-6">
          <Chips
            label="List"
            value={group}
            options={[["all", "All"], ...groups.map((g) => [g.id, g.short] as [string, string])]}
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
          <Chips
            label="Sort"
            value={sort}
            options={[
              ["az", "A–Z"],
              ["newest", "Newest"],
            ]}
            onChange={reset(setSort)}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="px-8 py-16 text-center text-cocoa/50">
          {doctors.length === 0 ? "No invitations yet. Add your first guest above." : "No guests match."}
        </p>
      ) : (
        <ul className="divide-y divide-cocoa/8 p-1 sm:p-4">
          {pageItems.map((d) => {
            const link = inviteLink(origin, d.slug);
            const g = groupOf(d);
            return (
              <li
                key={d.slug}
                className="grid grid-cols-[minmax(0,1fr)] gap-3 rounded-2xl p-3 transition-colors sm:p-4 hover:bg-cocoa/[0.03] lg:grid-cols-[minmax(0,1fr)_150px_auto] lg:items-center lg:gap-6"
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
                    <p className="mt-0.5 flex min-w-0 items-center gap-2 font-mono text-xs text-cocoa/50">
                      <span className="min-w-0 truncate">{link.replace(/^https?:\/\//, "")}</span>
                      <select
                        value={g}
                        onChange={(e) => {
                          let next = e.target.value;
                          if (next === OTHER) {
                            next = window.prompt("Category name (e.g. Media):")?.trim() ?? "";
                            if (!next) return;
                          }
                          patch(d, { group: next }, `Moved to ${groupLabel(next)}`);
                        }}
                        aria-label="Contact list"
                        title="Contact list"
                        className="shrink-0 cursor-pointer rounded-full border border-cocoa/10 bg-cocoa/[0.04] px-2 py-0.5 font-sans text-[11px] font-bold text-cocoa/70 focus:outline-none"
                      >
                        {groups.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.short}
                          </option>
                        ))}
                        <option value={OTHER}>Other…</option>
                      </select>
                    </p>
                  )}
                  {!d.viaGeneral && !d.phone && (
                    <button
                      type="button"
                      onClick={() => setEditing(d.slug)}
                      className="mt-1.5 cursor-pointer rounded-full bg-[#fff1d6] px-2.5 py-0.5 text-[11px] font-bold text-[#8a5300] transition-colors hover:bg-[#ffe2a8]"
                    >
                      No WhatsApp number · add
                    </button>
                  )}
                  {d.rsvp && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-teal/[0.06] px-3 py-2 text-sm text-cocoa/75">
                      <span className="text-[11px] font-bold tracking-wide text-teal uppercase">RSVP</span>
                      {d.rsvp.status === "attending" ? (
                        <span className="font-bold">
                          {d.rsvp.guests > 1 ? `${d.rsvp.guests} people (with a guest)` : "1 person"}
                        </span>
                      ) : (
                        <span className="font-bold">Can&apos;t attend</span>
                      )}
                      {d.rsvp.phone && (
                        <span>
                          Mobile: <span className="font-bold">{d.rsvp.phone}</span>
                        </span>
                      )}
                      {d.rsvp.message && <span className="italic">“{d.rsvp.message}”</span>}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:flex-col lg:flex-nowrap lg:items-end lg:gap-1">
                  <StatusBadge d={d} />
                  <span className="text-xs whitespace-nowrap text-cocoa/45">
                    {d.rsvp
                      ? `Replied ${when.format(new Date(d.rsvp.respondedAt))}`
                      : d.lastOpenedAt
                        ? `Seen ${when.format(new Date(d.lastOpenedAt))}`
                        : `Added ${when.format(new Date(d.createdAt))}`}
                  </span>
                  {/* Phones: the sent tick sits here so the icon row below fits the screen. */}
                  {!d.viaGeneral && (
                    <SentToggle d={d} onToggle={() => toggleSent(d)} className="ml-auto inline-flex lg:hidden" />
                  )}
                </div>
                {/* Desktop: every action has a fixed slot (blank when it doesn't apply) so all rows line up. */}
                <div className="-ml-2 flex flex-wrap items-center gap-0.5 lg:ml-0 lg:flex-nowrap lg:justify-end">
                  {d.viaGeneral ? (
                    <>
                      <span aria-hidden className="mr-1 hidden w-[92px] lg:block" />
                      <span aria-hidden className="hidden size-9 lg:block" />
                      <span aria-hidden className="hidden size-9 lg:block" />
                      <span aria-hidden className="hidden size-9 lg:block" />
                      <span aria-hidden className="hidden size-9 lg:block" />
                    </>
                  ) : (
                    <>
                      <SentToggle d={d} onToggle={() => toggleSent(d)} className="mr-1 hidden lg:inline-flex" />
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
                      {d.phone ? (
                        <a
                          className={iconBtn}
                          title={`Send on WhatsApp (${g === "ravinder" ? groupShort(g) : "Dr. Anand"}'s message)`}
                          target="_blank"
                          rel="noopener noreferrer"
                          href={whatsappUrl(d.phone, whatsappMessage(templateFor(settings, g), displayName(d), link))}
                        >
                          <WhatsAppIcon className="size-4 text-[#25D366]" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          className={iconBtn}
                          title="No WhatsApp number · click to add one"
                          aria-label="No WhatsApp number, add one"
                          onClick={() => setEditing(d.slug)}
                        >
                          <WhatsAppIcon className="size-4 text-cocoa/25" />
                        </button>
                      )}
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
                  {d.rsvp ? (
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
                  ) : (
                    <span aria-hidden className="hidden size-9 lg:block" />
                  )}
                  <button
                    type="button"
                    className={`${iconBtn} ${editing === d.slug ? "bg-cocoa/5 text-cocoa" : ""}`}
                    title="Edit name / number"
                    onClick={() => setEditing(editing === d.slug ? null : d.slug)}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={`${iconBtn} hover:bg-ember/10 hover:text-ember`}
                    title="Delete invitation"
                    onClick={() => remove(d)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {editing === d.slug && (
                  <EditGuest
                    d={d}
                    onCancel={() => setEditing(null)}
                    onSave={async (body) => {
                      if (await patch(d, body, "Saved")) setEditing(null);
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {shown.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cocoa/10 px-5 py-4 text-sm sm:px-8">
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
              <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Prev</span>
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
<span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
