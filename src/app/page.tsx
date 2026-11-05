import { db, DEFAULT_SETTINGS } from "@/lib/db";
import type { Settings } from "@/lib/types";
import Invitation from "@/components/invite/Invitation";

// Render per request so video / time changes from the admin show up immediately.
export const dynamic = "force-dynamic";

/** The general invitation: same experience as a personal one, for sharing with anyone. */
export default async function Home() {
  let settings: Settings = DEFAULT_SETTINGS;
  try {
    settings = await db.getSettings();
  } catch {
    // Storage not configured yet: still show the invitation with defaults.
  }
  return (
    <Invitation doctor={{ slug: "", name: "" }} videoUrl={settings.videoUrl} eventTime={settings.eventTime} />
  );
}
