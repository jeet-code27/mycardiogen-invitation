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

// Per request, so a time change in the admin shows up immediately.
export const dynamic = "force-dynamic";

/** One-screen reminder for everyone: a few lines of invitation and a quick "Yes" with name and number. */
export default async function ReminderPage() {
  let settings: Settings = DEFAULT_SETTINGS;
  try {
    settings = await db.getSettings();
  } catch {
    // Storage not configured: still show the page with defaults.
  }
  // 7:00 PM unless the admin has set another time.
  const eventTime = resolveEventTime(settings.eventTime);
  return <Reminder eventTime={eventTime} />;
}
