/** Fixed event details, shared by the invitation, OG image, calendar links and admin. */
export const EVENT = {
  title: "MyCardioGen India Launch",
  dateISO: "2026-11-28",
  weekday: "Saturday",
  day: "28",
  month: "November",
  year: "2026",
  dateLong: "Saturday, 28 November 2026",
  venueName: "Le Méridien",
  venueArea: "Windsor Place, New Delhi",
  venueFull: "Le Méridien, Windsor Place, New Delhi",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Le+M%C3%A9ridien+Windsor+Place+New+Delhi",
  website: "https://www.mycardiogen.com/",
} as const;

export const HOSTS = [
  {
    name: "Dr. Anand Singla",
    role: "Co-founder",
    detail: "Interventional Cardiologist, Chicago",
    photo: "/team/dr-anand-singla-2026-11.webp",
  },
  {
    name: "Dr. Sonam Chouksey",
    role: "Co-founder",
    detail: "",
    photo: "/team/dr-sonam-chouksey-2026-11.webp",
  },
  {
    name: "Dr. Ravinder Goyal",
    role: "Board of Directors",
    detail: "Serial Entrepreneur · Tech Innovator · Author",
    photo: "/team/dr-ravinder-goyal-2026-11.webp",
    bio: "A visionary entrepreneur with nearly three decades of experience in technology, skilling and innovation. As Co-Founder of Erekrut, he has pioneered transformative solutions in recruitment and education, impacting over 200,000 lives across 650+ centres. A recipient of the Golden Peacock and FICCI Skills Champion Awards, he continues to inspire through entrepreneurship, innovation and over 1,000 motivational writings.",
  },
] as const;

/** Event start as a Date. Without a time the countdown targets the start of the day (IST). */
export function eventStart(eventTime: string): Date {
  const time = /^\d{2}:\d{2}$/.test(eventTime) ? eventTime : "00:00";
  return new Date(`${EVENT.dateISO}T${time}:00+05:30`);
}

export function formatEventTime(eventTime: string): string {
  if (!/^\d{2}:\d{2}$/.test(eventTime)) return "";
  const [h, m] = eventTime.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix} onwards`;
}
