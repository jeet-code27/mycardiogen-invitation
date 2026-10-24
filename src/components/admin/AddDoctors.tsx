"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Copy, ExternalLink, ListPlus, LoaderCircle, UserPlus } from "lucide-react";
import type { Doctor } from "@/lib/types";
import { cleanName, slugify } from "@/lib/slug";
import { card, ghostBtn, input, primaryBtn, useToast } from "./ui";
import { copyText, inviteLink, whatsappMessage, whatsappUrl } from "./share";
import WhatsAppIcon from "./WhatsAppIcon";

/** "Anil Kapoor, 98765 43210" -> { name, phone } */
function parseLine(line: string) {
  const [name, ...rest] = line.split(/[,\t]/);
  return { name: name.trim(), phone: rest.join("").trim() };
}

export default function AddDoctors({
  origin,
  onCreated,
}: {
  origin: string;
  onCreated: (doctors: Doctor[]) => void;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState<Doctor[]>([]);

  const bulkEntries = bulk.split(/\r?\n/).map(parseLine).filter((e) => cleanName(e.name));

  async function create(entries: { name: string; phone?: string }[]) {
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
      setBulk("");
      toast(data.created.length === 1 ? "Invitation created" : `${data.created.length} invitations created`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invitations.");
    } finally {
      setBusy(false);
    }
  }

  const previewSlug = cleanName(name) ? slugify(name) : "dr-anil-kapoor";

  return (
    <div className={`${card} p-6 sm:p-8`}>
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

      {mode === "single" ? (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            create([{ name, phone }]);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <label className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-serif text-cocoa/50">
                Dr.
              </span>
              <input
                className={`${input} pl-12`}
                placeholder="Anil Kapoor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                aria-label="Doctor's name"
              />
            </label>
            <input
              className={input}
              placeholder="WhatsApp no. (optional)"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="WhatsApp number"
            />
          </div>
          <p className="mt-3 truncate font-mono text-xs text-cocoa/50">
            {origin.replace(/^https?:\/\//, "")}/<span className="text-teal">{previewSlug}</span>
          </p>
          <button type="submit" disabled={busy || !cleanName(name)} className={`${primaryBtn} mt-5`}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Create invitation
          </button>
        </form>
      ) : (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            create(bulkEntries);
          }}
        >
          <textarea
            className={`${input} min-h-40 font-mono text-sm`}
            placeholder={"One doctor per line. Phone is optional:\nAnil Kapoor, 9876543210\nPriya Sharma\nRahul Mehta, +91 98765 43210"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            aria-label="Doctor names, one per line"
          />
          <button type="submit" disabled={busy || bulkEntries.length === 0} className={`${primaryBtn} mt-5`}>
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
              <p className="text-sm font-bold text-teal">Ready to send — Dr. {last[0].name}</p>
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
                    whatsappMessage(last[0].name, inviteLink(origin, last[0].slug)),
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
