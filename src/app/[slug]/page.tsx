import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EVENT } from "@/lib/event";
import Invitation from "@/components/invite/Invitation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await db.getDoctor(slug);
  if (!doctor) return { title: "Invitation not found · MyCardioGen" };
  const title = doctor.chiefGuest
    ? `Dr. ${doctor.name}, Chief Guest · MyCardioGen India Launch`
    : `Dr. ${doctor.name}, you're invited · MyCardioGen India Launch`;
  const description = `The India launch of MyCardioGen — ${EVENT.dateLong} at ${EVENT.venueFull}. Please confirm your attendance.`;
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
        name: doctor.name,
        chiefGuest: doctor.chiefGuest,
        rsvp: doctor.rsvp && { status: doctor.rsvp.status, guests: doctor.rsvp.guests },
      }}
      videoUrl={settings.videoUrl}
      eventTime={settings.eventTime}
    />
  );
}
