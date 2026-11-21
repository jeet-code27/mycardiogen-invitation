"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CalendarDays, Check, Clock, Heart, LoaderCircle, MapPin } from "lucide-react";
import Logo from "@/components/Logo";
import { EVENT, formatEventTime } from "@/lib/event";
import { CalendarButtons } from "@/components/invite/EventDetails";
import { EASE, Eyebrow } from "@/components/invite/Reveal";
import VideoPlayer from "@/components/invite/VideoPlayer";

type Status = "attending" | "declined";

const SAVED_KEY = "mycardiogen-reminder-rsvp";

function readSavedSlug(): string | undefined {
  try {
    return localStorage.getItem(SAVED_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function saveSlug(slug: string) {
  try {
    localStorage.setItem(SAVED_KEY, slug);
  } catch {
    // Private mode: a repeat reply is still matched by mobile number.
  }
}

const field =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-brand/60 focus:outline-none";

// Small staggered entrance for each block.
const enter = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay: 0.1 + i * 0.08 },
});

/** `videoUrl` adds the founders' video under the invitation text (the /reminder-video page). */
export default function Reminder({ eventTime, videoUrl }: { eventTime: string; videoUrl?: string }) {
  const [choice, setChoice] = useState<Status | null>(null);
  const [done, setDone] = useState<Status | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const time = formatEventTime(eventTime).replace(/ onwards$/, "");
  const firstName = name.trim().replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "").split(" ")[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!choice) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: readSavedSlug(), name, phone, status: choice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.slug) saveSlug(data.slug);
      setDone(choice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grain relative min-h-svh overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(150,8,5,0.55),transparent_60%),radial-gradient(ellipse_at_100%_100%,rgba(33,134,141,0.16),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-svh max-w-md flex-col px-6 pt-5 pb-8">
        <motion.header {...enter(0)} className="flex items-center justify-between">
          <Logo className="h-9 w-auto" />
          <span className="glass rounded-full px-3.5 py-1 text-[10px] font-bold tracking-[0.3em] text-cream/80 uppercase">
            28.11.26
          </span>
        </motion.header>

        <motion.div {...enter(1)} className="mt-5 text-center">
          <Eyebrow className="justify-center">An invitation to join us</Eyebrow>
          <h1 className="mt-3 font-serif text-[2.1rem] leading-[1.1]">
            <span className="text-cream/80">The Launch of</span>
            <br />
            MyCardio<span className="text-gradient-red">Gen</span>
          </h1>
        </motion.div>

        <motion.p {...enter(2)} className="mt-3 text-center text-[15px] leading-relaxed text-cream/75">
          We would be delighted to have you join us as we celebrate the launch of MyCardioGen and the beginning of a
          new journey towards greater awareness and understanding of cardiovascular health.
        </motion.p>
        <motion.p {...enter(3)} className="mt-2.5 text-center font-serif text-[15px] text-cream/60 italic">
          An occasion to come together, share perspectives and mark a meaningful milestone.
        </motion.p>

        <motion.div {...enter(4)} className="glass mt-4 grid gap-2 rounded-2xl px-4 py-3 text-sm">
          <p className="flex items-center gap-3">
            <CalendarDays className="size-4 shrink-0 text-brand" />
            <span className="font-bold">{EVENT.dateLong}</span>
          </p>
          {time && (
            <p className="flex items-center gap-3">
              <Clock className="size-4 shrink-0 text-brand" />
              <span className="font-bold">{time}</span>
            </p>
          )}
          <a
            href={EVENT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-cream/90 hover:text-cream"
          >
            <MapPin className="size-4 shrink-0 text-cyan" />
            <span>
              <span className="font-bold">{EVENT.venueName}</span>, {EVENT.venueArea}
            </span>
          </a>
        </motion.div>

        <motion.p {...enter(5)} className="mt-3 text-center text-[15px] leading-relaxed text-cream/75">
          Your presence would make this occasion even more special. We look forward to welcoming you.
        </motion.p>

        {videoUrl !== undefined && (
          <motion.div {...enter(5)} className="mt-4">
            <VideoPlayer videoUrl={videoUrl} compact />
          </motion.div>
        )}

        <motion.div {...enter(6)} className="mt-4">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-6 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className={`mx-auto grid size-14 place-items-center rounded-full ${
                    done === "attending"
                      ? "bg-gradient-to-br from-[#ff7a1a] to-ember shadow-[0_0_50px_rgba(253,41,27,0.6)]"
                      : "bg-white/10"
                  }`}
                >
                  {done === "attending" ? (
                    <Heart className="size-6 fill-white text-white" />
                  ) : (
                    <Check className="size-6 text-cream" />
                  )}
                </motion.span>
                {done === "attending" ? (
                  <>
                    <h2 className="mt-4 font-serif text-2xl">Thank you{firstName ? `, ${firstName}` : ""}!</h2>
                    <p className="mt-2 text-sm leading-relaxed text-cream/70">
                      Your attendance is confirmed. See you on 28 November at {EVENT.venueName}.
                    </p>
                    <CalendarButtons eventTime={eventTime} className="mt-4 justify-center" />
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 font-serif text-2xl">Thank you for letting us know</h2>
                    <p className="mt-2 text-sm leading-relaxed text-cream/70">You will be missed.</p>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setDone(null)}
                  className="mt-4 cursor-pointer text-sm text-cream/50 underline underline-offset-4 hover:text-cream"
                >
                  Change my response
                </button>
              </motion.div>
            ) : choice ? (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="grid gap-3"
              >
                <p className="text-center text-sm font-bold text-cream/80">
                  {choice === "attending" ? "Wonderful! Just your name and number:" : "Sorry to miss you. Your name, please:"}
                </p>
                <input
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={80}
                  required
                  autoFocus
                  aria-label="Your full name"
                />
                <input
                  className={field}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={choice === "attending" ? "Mobile number" : "Mobile number (optional)"}
                  required={choice === "attending"}
                  aria-label="Mobile number"
                />
                {error && <p className="text-center text-sm text-coral">{error}</p>}
                <button
                  type="submit"
                  disabled={busy || !name.trim() || (choice === "attending" && phone.replace(/\D/g, "").length < 10)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a1a] via-brand to-ember px-6 py-3.5 font-bold text-white shadow-[0_12px_40px_-10px_rgba(253,41,27,0.9)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  {busy && <LoaderCircle className="size-5 animate-spin" />}
                  {choice === "attending" ? "Confirm my attendance" : "Send my reply"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChoice(null);
                    setError("");
                  }}
                  className="mx-auto inline-flex cursor-pointer items-center gap-1.5 text-sm text-cream/50 hover:text-cream"
                >
                  <ArrowLeft className="size-4" /> Back
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="ask"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="text-center"
              >
                <button
                  type="button"
                  onClick={() => setChoice("attending")}
                  className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ff7a1a] via-brand to-ember px-6 py-4 font-bold tracking-wide text-white shadow-[0_14px_50px_-10px_rgba(253,41,27,0.9)] transition-transform hover:scale-[1.02]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Check className="size-5" /> Yes, I&apos;ll be there
                </button>
                <button
                  type="button"
                  onClick={() => setChoice("declined")}
                  className="mt-3 cursor-pointer text-sm text-cream/50 underline-offset-4 hover:text-cream hover:underline"
                >
                  Unable to attend?
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p {...enter(7)} className="mt-auto pt-6 text-center text-sm text-cream/55">
          With warm regards,
          <span className="mt-0.5 block font-serif text-lg text-cream/85">Team MyCardioGen</span>
        </motion.p>
      </div>
    </main>
  );
}
