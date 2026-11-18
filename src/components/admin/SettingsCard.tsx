"use client";

import { useState } from "react";
import { Film, LoaderCircle, MessageCircle } from "lucide-react";
import type { Settings } from "@/lib/types";
import { parseVideo } from "@/lib/video";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { card, input, primaryBtn, useToast } from "./ui";

export default function SettingsCard({
  initial,
  onSaved,
}: {
  initial: Settings;
  onSaved: (settings: Settings) => void;
}) {
  const toast = useToast();
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [eventTime, setEventTime] = useState(initial.eventTime);
  // Shows the default text when nothing custom is saved, so it can be edited in place.
  const [message, setMessage] = useState(initial.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    videoUrl !== saved.videoUrl ||
    eventTime !== saved.eventTime ||
    message !== (saved.whatsappMessage || DEFAULT_WHATSAPP_MESSAGE);
  const parsed = parseVideo(videoUrl);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, eventTime, whatsappMessage: message }),
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
    <form onSubmit={save} className={`${card} p-6 sm:p-8`}>
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
        <textarea
          className={`${input} min-h-56 text-sm leading-relaxed`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={3000}
        />
        <span className="mt-2 block text-xs text-cocoa/50">
          Sent with every WhatsApp button. <code className="font-bold">{"{link}"}</code> becomes the guest&apos;s
          link and <code className="font-bold">{"{name}"}</code> their name (e.g. add a first line &ldquo;Dear{" "}
          {"{name}"},&rdquo;).{" "}
          {message !== DEFAULT_WHATSAPP_MESSAGE && (
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

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      <button type="submit" disabled={!dirty || busy} className={`${primaryBtn} mt-6`}>
        {busy && <LoaderCircle className="size-4 animate-spin" />}
        Save settings
      </button>
    </form>
  );
}
