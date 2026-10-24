"use client";

import { useSyncExternalStore } from "react";
import { CalendarPlus, Clock, Navigation } from "lucide-react";
import { EVENT, eventStart, formatEventTime } from "@/lib/event";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import Reveal, { Eyebrow } from "./Reveal";

// A once-per-second clock; null on the server so the first render hydrates cleanly.
const subscribeSeconds = (tick: () => void) => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
const serverSeconds = () => null;

function useCountdown(target: Date) {
  const now = useSyncExternalStore(subscribeSeconds, nowSeconds, serverSeconds);
  if (now === null) return null;
  const diff = Math.max(0, target.getTime() - now * 1000);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export function CalendarButtons({ eventTime, className = "" }: { eventTime: string; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={googleCalendarUrl(eventTime)}
        target="_blank"
        rel="noopener noreferrer"
        className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-cream/90 transition-colors hover:border-cream/30 hover:text-cream"
      >
        <CalendarPlus className="size-4 text-brand" />
        Google Calendar
      </a>
      <button
        type="button"
        onClick={() => downloadIcs(eventTime)}
        className="glass inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-cream/90 transition-colors hover:border-cream/30 hover:text-cream"
      >
        <CalendarPlus className="size-4 text-cyan" />
        Apple / Outlook
      </button>
    </div>
  );
}

export default function EventDetails({ eventTime }: { eventTime: string }) {
  const left = useCountdown(eventStart(eventTime));
  const time = formatEventTime(eventTime);

  return (
    <section id="details" className="relative scroll-mt-6 px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <Eyebrow className="justify-center">Save the Date</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl sm:text-5xl">When &amp; Where</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="glass relative h-full overflow-hidden rounded-[28px] p-8 sm:p-10">
              <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-brand/20 blur-3xl" />
              <p className="text-[11px] font-bold tracking-[0.32em] text-cyan uppercase">Date</p>
              <div className="mt-5 flex items-end gap-5">
                <span className="text-gradient-red font-serif text-8xl leading-[0.8] sm:text-9xl">{EVENT.day}</span>
                <div className="pb-1">
                  <p className="font-serif text-2xl sm:text-3xl">
                    {EVENT.month} {EVENT.year}
                  </p>
                  <p className="text-cream/60">{EVENT.weekday}</p>
                </div>
              </div>
              {time && (
                <p className="mt-6 inline-flex items-center gap-2 text-cream/80">
                  <Clock className="size-4 text-brand" />
                  {time}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass relative h-full overflow-hidden rounded-[28px] p-8 sm:p-10">
              <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-teal/25 blur-3xl" />
              <p className="text-[11px] font-bold tracking-[0.32em] text-cyan uppercase">Venue</p>
              <p className="mt-5 font-serif text-4xl sm:text-5xl">{EVENT.venueName}</p>
              <p className="mt-2 text-lg text-cream/65">{EVENT.venueArea}</p>
              <a
                href={EVENT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-bold text-cocoa transition-transform hover:scale-[1.03]"
              >
                <Navigation className="size-4" />
                Get directions
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-5">
          <div className="glass flex flex-col items-center justify-between gap-8 rounded-[28px] p-8 sm:p-10 lg:flex-row">
            <div className="grid w-full max-w-lg grid-cols-4 gap-3 sm:gap-5">
              {(["days", "hours", "minutes", "seconds"] as const).map((k) => (
                <div key={k} className="text-center">
                  <div className="rounded-2xl border border-white/10 bg-black/30 py-4 font-serif text-3xl tabular-nums sm:text-5xl">
                    {left ? String(left[k]).padStart(2, "0") : "--"}
                  </div>
                  <p className="mt-2 text-[10px] font-bold tracking-[0.25em] text-cream/50 uppercase sm:text-[11px]">
                    {k}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center lg:text-left">
              <p className="font-serif text-xl">Add it to your calendar</p>
              <CalendarButtons eventTime={eventTime} className="mt-4 justify-center lg:justify-start" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
