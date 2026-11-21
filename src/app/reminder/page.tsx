import type { Metadata } from "next";
import { db, DEFAULT_SETTINGS } from "@/lib/db";
import type { Settings } from "@/lib/types";
import Reminder from "@/components/reminder/Reminder";

export const metadata: Metadata = {
  title: "A reminder · MyCardioGen India Launch",
  description:
    "Join us for the launch of MyCardioGen. Saturday, 28 November 2026, 7:30 PM, Le Méridien, Windsor Place, New Delhi.",
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
  // The launch starts at 7:30 PM unless the admin has set a time.
  const eventTime = /^\d{2}:\d{2}$/.test(settings.eventTime) ? settings.eventTime : "19:30";
  return <Reminder eventTime={eventTime} />;
}
