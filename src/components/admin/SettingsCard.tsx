"use client";

import { useState } from "react";
import { Film, LoaderCircle } from "lucide-react";
import type { Settings } from "@/lib/types";
import { parseVideo } from "@/lib/video";
import { card, input, primaryBtn, useToast } from "./ui";

export default function SettingsCard({ initial }: { initial: Settings }) {
  const toast = useToast();
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [eventTime, setEventTime] = useState(initial.eventTime);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dirty = videoUrl !== saved.videoUrl || eventTime !== saved.eventTime;
  const parsed = parseVideo(videoUrl);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, eventTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      setSaved(data.settings);
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
          type="url"
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

      {error && <p className="mt-4 text-sm text-ember">{error}</p>}

      <button type="submit" disabled={!dirty || busy} className={`${primaryBtn} mt-6`}>
        {busy && <LoaderCircle className="size-4 animate-spin" />}
        Save settings
      </button>
    </form>
  );
}
