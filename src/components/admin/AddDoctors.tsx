"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Crown, ExternalLink, ListPlus, LoaderCircle, UserPlus } from "lucide-react";
import type { Doctor, Settings } from "@/lib/types";
import { type Group, groupOf } from "@/lib/groups";
import { templateFor } from "@/lib/whatsapp";
import { TITLES, cleanName, displayName, parseGuest, slugify } from "@/lib/slug";
import { card, ghostBtn, input, primaryBtn, useToast } from "./ui";
import { copyText, inviteLink, whatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

function TitleSelect({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Title"
      className={`${input} cursor-pointer font-serif ${className}`}
    >
      {TITLES.map((t) => (
        <option key={t} value={t}>
          {t || "No title"}
        </option>
      ))}
    </select>
  );
}

/** "Anil Kapoor, 98765 43210" -> { name, phone } */
function parseLine(line: string) {
  const [name, ...rest] = line.split(/[,\t]/);
  return { name: name.trim(), phone: rest.join("").trim() };
}

export default function AddDoctors({
  origin,
  settings,
  groups,
  onCreated,
}: {
  origin: string;
  settings: Pick<Settings, "whatsappMessage" | "whatsappMessageRavinder">;
  /** Lists to offer: the built-in ones plus custom categories already in use. */
  groups: Group[];
  onCreated: (doctors: Doctor[]) => void;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [chiefGuest, setChiefGuest] = useState(false);
  // Title used when a name is typed without one ("Mr. Bipin Gupta" keeps its own).
  const [title, setTitle] = useState<string>("Dr.");
  const [group, setGroup] = useState("anand");
  // "Other": the admin types a new category name.
  const [otherMode, setOtherMode] = useState(false);
  const [customGroup, setCustomGroup] = useState("");
  const chosenGroup = otherMode ? customGroup.trim() : group;
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState<Doctor[]>([]);

  const bulkEntries = bulk.split(/\r?\n/).map(parseLine).filter((e) => cleanName(e.name));

  async function create(
    entries: { name: string; phone?: string; chiefGuest?: boolean; defaultTitle?: string; group?: string }[],
  ) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create invitations.");
      onCreated(data.created);
      setLast(data.created);
      setName("");
      setPhone("");
      setChiefGuest(false);
      setBulk("");
      toast(data.created.length === 1 ? "Invitation created" : `${data.created.length} invitations created`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invitations.");
    } finally {
      setBusy(false);
    }
  }

  const preview = parseGuest(name || "Anil Kapoor", title);
  const previewSlug = slugify(preview.name, preview.title);

  return (
    <div className={`${card} p-5 sm:p-8`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Invite a doctor</h2>
          <p className="mt-1 text-sm text-cocoa/60">Each doctor gets a personal link with their name on it.</p>
        </div>
        <div className="flex rounded-full bg-cocoa/5 p-1 text-sm font-bold">
          {(
            [
              ["single", "One", UserPlus],
              ["bulk", "Bulk", ListPlus],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 transition-colors ${
                mode === value ? "bg-white text-cocoa shadow-sm" : "text-cocoa/55 hover:text-cocoa"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-bold text-cocoa/70">Add to</span>
        {groups.map((g) => {
          const on = !otherMode && group === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setGroup(g.id);
                setOtherMode(false);
              }}
              aria-pressed={on}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                on ? "bg-cocoa text-cream" : "bg-cocoa/5 text-cocoa/60 hover:text-cocoa"
              }`}
            >
              {g.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOtherMode(true)}
          aria-pressed={otherMode}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            otherMode ? "bg-cocoa text-cream" : "bg-cocoa/5 text-cocoa/60 hover:text-cocoa"
          }`}
        >
          Other…
        </button>
        {otherMode && (
          <input
            className={`${input} w-full! py-1.5! text-base sm:w-56! sm:text-sm`}
            value={customGroup}
            onChange={(e) => setCustomGroup(e.target.value)}
            placeholder="Type a category, e.g. Media"
            maxLength={40}
            aria-label="Other category name"
            autoFocus
          />
        )}
      </div>

      {mode === "single" ? (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            create([{ name, phone, chiefGuest, defaultTitle: title, group: chosenGroup }]);
          }}
        >
          {/* Phones: title + name on one line, number below. */}
          <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 sm:grid-cols-[110px_1fr_200px]">
            <TitleSelect value={title} onChange={setTitle} />
            <label className="relative block">
              <input
                className={input}
                placeholder="Anil Kapoor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                aria-label="Doctor's name"
              />
            </label>
            <input
              className={`${input} col-span-2 sm:col-span-1`}
              placeholder="WhatsApp no. (optional)"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="WhatsApp number"
            />
          </div>
          <label
            className={`mt-3 inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              chiefGuest
                ? "border-[#e8a53c] bg-[#fff1d6] text-[#8a5300]"
                : "border-cocoa/15 bg-white text-cocoa/60 hover:text-cocoa"
            }`}
          >
            <input
              type="checkbox"
              checked={chiefGuest}
              onChange={(e) => setChiefGuest(e.target.checked)}
              className="size-4 accent-[#e8a53c]"
            />
            <Crown className="size-4" />
            Invite as Chief Guest
          </label>
          <p className="mt-3 truncate font-mono text-xs text-cocoa/50">
            {origin.replace(/^https?:\/\//, "")}/<span className="text-teal">{previewSlug}</span>
          </p>
          <button type="submit" disabled={busy || !cleanName(name) || (otherMode && !chosenGroup)} className={`${primaryBtn} mt-5`}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Create invitation
          </button>
        </form>
      ) : (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            create(bulkEntries.map((e) => ({ ...e, defaultTitle: title, group: chosenGroup })));
          }}
        >
          <label className="mb-3 flex flex-wrap items-center gap-3 text-sm font-bold text-cocoa/70">
            Title for names typed without one
            <TitleSelect value={title} onChange={setTitle} className="w-28" />
          </label>
          <textarea
            className={`${input} min-h-40 font-mono text-base sm:text-sm`}
            placeholder={"One guest per line. Phone is optional:\nAnil Kapoor, 9876543210\nMr. Bipin Gupta, 9872034436\nRahul Mehta, +91 98765 43210"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            aria-label="Doctor names, one per line"
          />
          <button type="submit" disabled={busy || bulkEntries.length === 0 || (otherMode && !chosenGroup)} className={`${primaryBtn} mt-5`}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <ListPlus className="size-4" />}
            Create {bulkEntries.length || ""} invitation{bulkEntries.length === 1 ? "" : "s"}
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      <AnimatePresence>
        {last.length === 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-2xl border border-teal/25 bg-teal/5 p-4">
              <p className="text-sm font-bold text-teal">
                Ready to send — {displayName(last[0])}
                {last[0].chiefGuest && " (Chief Guest)"}
              </p>
              <p className="mt-1 truncate font-mono text-sm text-cocoa/80">{inviteLink(origin, last[0].slug)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={async () => {
                    if (await copyText(inviteLink(origin, last[0].slug))) toast("Link copied");
                  }}
                >
                  <Copy className="size-4" /> Copy link
                </button>
                <a
                  className={ghostBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={whatsappUrl(
                    last[0].phone,
                    whatsappMessage(templateFor(settings, groupOf(last[0])), displayName(last[0]), inviteLink(origin, last[0].slug)),
                  )}
                >
                  <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
                </a>
                <a className={ghostBtn} target="_blank" rel="noopener noreferrer" href={`/${last[0].slug}`}>
                  <ExternalLink className="size-4" /> Preview
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
