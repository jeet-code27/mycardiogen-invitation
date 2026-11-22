"use client";

import { useState } from "react";
import { Film, LoaderCircle, MessageCircle } from "lucide-react";
import type { MessageKey, Settings } from "@/lib/types";
import { parseVideo } from "@/lib/video";
import { DEFAULT_WHATSAPP_MESSAGE, messageKeyFor } from "@/lib/whatsapp";
import { MESSAGE_GROUPS, type Group } from "@/lib/groups";
import { card, input, primaryBtn, useToast } from "./ui";

export default function SettingsCard({
  initial,
  groups,
  onSaved,
}: {
  initial: Settings;
  /** Every contact list in use, so each can be given Dr. Anand's or Dr. Ravinder's message. */
  groups: Group[];
  onSaved: (settings: Settings) => void;
}) {
  const toast = useToast();
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [eventTime, setEventTime] = useState(initial.eventTime);
  // Shows the default text when nothing custom is saved, so it can be edited in place.
  const [message, setMessage] = useState(initial.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE);
  const [messageRavinder, setMessageRavinder] = useState(initial.whatsappMessageRavinder);
  const [messageFor, setMessageFor] = useState<string>("anand");
  const [listMessages, setListMessages] = useState<Record<string, MessageKey>>(initial.listMessages ?? {});
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    videoUrl !== saved.videoUrl ||
    eventTime !== saved.eventTime ||
    message !== (saved.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE) ||
    messageRavinder !== saved.whatsappMessageRavinder ||
    groups.some((g) => messageKeyFor({ listMessages }, g.id) !== messageKeyFor(saved, g.id));
  const parsed = parseVideo(videoUrl);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          eventTime,
          whatsappMessage: message,
          whatsappMessageRavinder: messageRavinder,
          listMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setSaved(data.settings);
      onSaved(data.settings);
      toast("Saved — live on every invitation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className={`${card} p-5 sm:p-8`}>
      <h2 className="font-serif text-2xl">Invitation settings</h2>
      <p className="mt-1 text-sm text-cocoa/60">Applies to every invitation instantly.</p>

      <label className="mt-6 block">
        <span className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Film className="size-4 text-brand" /> Founders&apos; video
        </span>
        <input
          className={input}
          type="text"
          inputMode="url"
          placeholder="YouTube, Vimeo, Google Drive or .mp4 link"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <span className="mt-2 block text-xs text-cocoa/50">
          {videoUrl
            ? parsed
              ? "Looks good. The same video plays on every invitation."
              : "That doesn't look like a valid link."
            : "Leave empty to show the “Video message coming soon” placeholder."}
        </span>
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-bold">Event start time (IST)</span>
        <input
          className={input}
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
        />
        <span className="mt-2 block text-xs text-cocoa/50">
          Optional. Shown on the invitation and used for the countdown and calendar invites.
        </span>
      </label>

      <label className="mt-5 block">
        <span className="mb-2 flex items-center gap-2 text-sm font-bold">
          <MessageCircle className="size-4 text-[#25D366]" /> WhatsApp message
        </span>
        <span className="mb-2 flex rounded-full bg-cocoa/5 p-1 text-xs font-bold">
          {MESSAGE_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setMessageFor(g.id)}
              aria-pressed={messageFor === g.id}
              className={`flex-1 cursor-pointer rounded-full px-3 py-1.5 transition-colors ${
                messageFor === g.id ? "bg-white text-cocoa shadow-sm" : "text-cocoa/55 hover:text-cocoa"
              }`}
            >
              {g.label}
            </button>
          ))}
        </span>
        {messageFor === "anand" ? (
          <textarea
            className={`${input} min-h-56 text-base leading-relaxed sm:text-sm`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={3000}
            aria-label="WhatsApp message for Dr. Anand's contacts"
          />
        ) : (
          <textarea
            className={`${input} min-h-56 text-base leading-relaxed sm:text-sm`}
            value={messageRavinder}
            onChange={(e) => setMessageRavinder(e.target.value)}
            maxLength={3000}
            placeholder={"Write Dr. Ravinder's message here.\nUntil it is written, lists set to his message get Dr. Anand's.\n\nPlease open your invitation and RSVP here:\n{link}"}
            aria-label="WhatsApp message for Dr. Ravinder's contacts"
          />
        )}
        <span className="mt-2 block text-xs text-cocoa/50">
          Sent with every WhatsApp button. <code className="font-bold">{"{link}"}</code> becomes the guest&apos;s
          link and <code className="font-bold">{"{name}"}</code> their name (e.g. add a first line &ldquo;Dear{" "}
          {"{name}"},&rdquo;).{" "}
          {messageFor === "anand" && message !== DEFAULT_WHATSAPP_MESSAGE && (
            <button
              type="button"
              onClick={() => setMessage(DEFAULT_WHATSAPP_MESSAGE)}
              className="cursor-pointer font-bold text-teal underline underline-offset-2"
            >
              Reset to default
            </button>
          )}
        </span>
      </label>

      <div className="mt-5">
        <p className="text-sm font-bold">Which list gets which message</p>
        <div className="mt-2 divide-y divide-cocoa/8 rounded-xl border border-cocoa/10">
          {groups.map((g) => {
            const current = messageKeyFor({ listMessages }, g.id);
            return (
              <div key={g.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0 truncate text-sm text-cocoa/80">{g.label}</span>
                <span className="flex shrink-0 rounded-full bg-cocoa/5 p-0.5 text-xs font-bold">
                  {(
                    [
                      ["anand", "Dr. Anand"],
                      ["ravinder", "Dr. Ravinder"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setListMessages((m) => ({ ...m, [g.id]: key }))}
                      aria-pressed={current === key}
                      aria-label={`${g.label}: ${label}'s message`}
                      className={`cursor-pointer rounded-full px-3 py-1 transition-colors ${
                        current === key ? "bg-cocoa text-cream" : "text-cocoa/55 hover:text-cocoa"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
        <span className="mt-2 block text-xs text-cocoa/50">
          The WhatsApp button next to each guest sends the message chosen for their list.
        </span>
      </div>

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      <button type="submit" disabled={!dirty || busy} className={`${primaryBtn} mt-6`}>
        {busy && <LoaderCircle className="size-4 animate-spin" />}
        Save settings
      </button>
    </form>
  );
}
