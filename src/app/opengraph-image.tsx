import { OG_SIZE, renderInviteCard } from "@/lib/og";

export const alt = "MyCardioGen India launch — by invitation only";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderInviteCard();
}
