import { db } from "@/lib/db";
import { OG_SIZE, renderInviteCard } from "@/lib/og";

export const alt = "Your invitation to the MyCardioGen India launch";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = await db.getDoctor(slug).catch(() => null);
  return renderInviteCard(doctor?.name);
}
