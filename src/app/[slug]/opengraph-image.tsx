import { db } from "@/lib/db";
import { resolveEventTime, shortEventTime } from "@/lib/event";
import { OG_SIZE, renderInviteCard } from "@/lib/og";
import { displayName } from "@/lib/slug";

export const alt = "Your invitation to the MyCardioGen India launch";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [doctor, settings] = await Promise.all([db.getDoctor(slug).catch(() => null), db.getSettings().catch(() => null)]);
  return renderInviteCard(
    doctor && !doctor.viaGeneral ? displayName(doctor) : undefined,
    doctor?.chiefGuest,
    shortEventTime(resolveEventTime(settings?.eventTime)),
  );
}
