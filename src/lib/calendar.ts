import { EVENT, eventStart } from "./event";

const DETAILS =
  "You are cordially invited to the India launch of MyCardioGen — a paradigm shift in preventive heart screening.";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Timed event (3h) when a time is set, otherwise an all-day event. */
function range(eventTime: string): { start: string; end: string; allDay: boolean } {
  if (/^\d{2}:\d{2}$/.test(eventTime)) {
    const start = eventStart(eventTime);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    return { start: stamp(start), end: stamp(end), allDay: false };
  }
  return { start: "20261128", end: "20261129", allDay: true };
}

export function googleCalendarUrl(eventTime: string): string {
  const { start, end } = range(eventTime);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${start}/${end}`,
    details: DETAILS,
    location: EVENT.venueFull,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadIcs(eventTime: string) {
  const { start, end, allDay } = range(eventTime);
  const fmt = (v: string) => (allDay ? `;VALUE=DATE:${v}` : `:${v}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MyCardioGen//Invitation//EN",
    "BEGIN:VEVENT",
    `UID:mycardiogen-india-launch-2026@mycardiogen.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART${fmt(start)}`,
    `DTEND${fmt(end)}`,
    `SUMMARY:${EVENT.title}`,
    `DESCRIPTION:${DETAILS}`,
    `LOCATION:${EVENT.venueFull.replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "MyCardioGen-India-Launch.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
