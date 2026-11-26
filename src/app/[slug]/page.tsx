import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EVENT, resolveEventTime, shortEventTime } from "@/lib/event";
import Invitation from "@/components/invite/Invitation";
import { displayName } from "@/lib/slug";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [doctor, settings] = await Promise.all([db.getDoctor(slug), db.getSettings().catch(() => null)]);
  if (!doctor) return { title: "Invitation not found · MyCardioGen" };
  const title = doctor.chiefGuest
    ? `${displayName(doctor)}, Chief Guest · MyCardioGen India Launch`
    : `${displayName(doctor)}, you're invited · MyCardioGen India Launch`;
  const description = `The India launch of MyCardioGen — ${EVENT.dateLong}, ${shortEventTime(resolveEventTime(settings?.eventTime))} at ${EVENT.venueFull}. Please confirm your attendance.`;
  return { title, description, openGraph: { title, description, type: "website" } };
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const [doctor, settings] = await Promise.all([db.getDoctor(slug), db.getSettings()]);
  // General-link guests only exist to hold an RSVP; they have no personal page.
  if (!doctor || doctor.viaGeneral) notFound();

  return (
    <Invitation
      doctor={{
        slug: doctor.slug,
        name: displayName(doctor),
        chiefGuest: doctor.chiefGuest,
        rsvp: doctor.rsvp && { status: doctor.rsvp.status, guests: doctor.rsvp.guests },
      }}
      videoUrl={settings.videoUrl}
      eventTime={resolveEventTime(settings.eventTime)}
    />
  );
}
