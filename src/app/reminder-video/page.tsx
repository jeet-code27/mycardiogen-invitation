import type { Metadata } from "next";
import { db, DEFAULT_SETTINGS } from "@/lib/db";
import type { Settings } from "@/lib/types";
import { resolveEventTime } from "@/lib/event";
import Reminder from "@/components/reminder/Reminder";

export const metadata: Metadata = {
  title: "A reminder · MyCardioGen India Launch",
  description:
    "Join us for the launch of MyCardioGen. Saturday, 28 November 2026, 7:00 PM, Le Méridien, Windsor Place, New Delhi.",
};

// Per request, so video / time changes in the admin show up immediately.
export const dynamic = "force-dynamic";

/** The /reminder page with the founders' video (the same one as on the invitation) below the text. */
export default async function ReminderVideoPage() {
  let settings: Settings = DEFAULT_SETTINGS;
  try {
    settings = await db.getSettings();
  } catch {
    // Storage not configured: still show the page with defaults.
  }
  const eventTime = resolveEventTime(settings.eventTime);
  return <Reminder eventTime={eventTime} videoUrl={settings.videoUrl} />;
}
