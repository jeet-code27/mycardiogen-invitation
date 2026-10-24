"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, LoaderCircle, X } from "lucide-react";
import type { PublicDoctor, RsvpStatus } from "@/lib/types";
import { EVENT } from "@/lib/event";
import { CalendarButtons } from "./EventDetails";
import Reveal, { EASE, Eyebrow } from "./Reveal";

type Result = NonNullable<PublicDoctor["rsvp"]>;

export default function Rsvp({
  doctor,
  eventTime,
}: {
  doctor: PublicDoctor;
  eventTime: string;
}) {
  const [result, setResult] = useState<Result | undefined>(doctor.rsvp);
  const [choice, setChoice] = useState<RsvpStatus | null>(null);
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!choice) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: doctor.slug, status: choice, guests, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data.rsvp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="rsvp" className="relative scroll-mt-6 px-6 py-20 sm:px-10 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(253,41,27,0.22),transparent_55%)]" />
      <Reveal className="relative mx-auto max-w-2xl">
        <div className="rounded-[34px] bg-gradient-to-b from-brand/70 via-white/10 to-cyan/30 p-px shadow-[0_50px_140px_-40px_rgba(253,41,27,0.7)]">
          <div className="relative overflow-hidden rounded-[33px] bg-[linear-gradient(170deg,#1c0705,#0d0403_55%,#0b0302)] px-6 py-12 sm:px-14 sm:py-16">
            <div className="pointer-events-none absolute -top-32 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.25, 1, 1.12, 1] }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`mx-auto grid size-20 place-items-center rounded-full ${
                      result.status === "attending"
                        ? "bg-gradient-to-br from-[#ff7a1a] to-ember shadow-[0_0_60px_rgba(253,41,27,0.7)]"
                        : "bg-white/10"
                    }`}
                  >
                    {result.status === "attending" ? (
                      <Heart className="size-9 fill-white text-white" />
                    ) : (
                      <Check className="size-9 text-cream" />
                    )}
                  </motion.span>
                  {result.status === "attending" ? (
                    <>
                      <h2 className="mt-8 font-serif text-3xl sm:text-4xl">Thank you, Dr. {doctor.name}!</h2>
                      <p className="mx-auto mt-4 max-w-md leading-relaxed text-cream/70">
                        Your attendance{result.guests > 1 ? " with a guest" : ""} is confirmed. We look forward to
                        welcoming you personally on {EVENT.dateLong} at {EVENT.venueName}, New Delhi.
                      </p>
                      <CalendarButtons eventTime={eventTime} className="mt-8 justify-center" />
                    </>
                  ) : (
                    <>
                      <h2 className="mt-8 font-serif text-3xl sm:text-4xl">Thank you for letting us know</h2>
                      <p className="mx-auto mt-4 max-w-md leading-relaxed text-cream/70">
                        You will be missed, Dr. {doctor.name}. We hope to have the pleasure of meeting you soon.
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setChoice(result.status);
                      setGuests(result.guests || 1);
                      setResult(undefined);
                    }}
                    className="mt-8 cursor-pointer text-sm text-cream/50 underline underline-offset-4 hover:text-cream"
                  >
                    Change my response
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative text-center"
                >
                  <Eyebrow className="justify-center">Kindly RSVP</Eyebrow>
                  <h2 className="mt-6 font-serif text-3xl leading-tight sm:text-5xl">
                    Please confirm your attendance.
                  </h2>
                  <p className="mt-4 font-serif text-lg text-cream/70 italic sm:text-xl">
                    We would love to welcome you personally.
                  </p>

                  <div className="mt-10 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        { value: "attending", label: "Joyfully accept", sub: "I will be there", Icon: Check },
                        { value: "declined", label: "Regretfully decline", sub: "I am unable to attend", Icon: X },
                      ] as const
                    ).map(({ value, label, sub, Icon }) => {
                      const selected = choice === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setChoice(value)}
                          aria-pressed={selected}
                          className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                            selected
                              ? value === "attending"
                                ? "border-brand bg-brand/15 shadow-[0_0_40px_-10px_rgba(253,41,27,0.8)]"
                                : "border-cream/50 bg-white/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/25"
                          }`}
                        >
                          <span
                            className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors ${
                              selected
                                ? value === "attending"
                                  ? "bg-brand text-white"
                                  : "bg-cream text-cocoa"
                                : "bg-white/10 text-cream/70"
                            }`}
                          >
                            <Icon className="size-5" />
                          </span>
                          <span>
                            <span className="block font-bold">{label}</span>
                            <span className="block text-sm text-cream/55">{sub}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence initial={false}>
                    {choice && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-4 pt-6 text-left">
                          {choice === "attending" && (
                            <div>
                              <p className="mb-2 text-sm font-bold text-cream/70">Attending</p>
                              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1.5">
                                {[1, 2].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setGuests(n)}
                                    className={`cursor-pointer rounded-xl py-2.5 text-sm font-bold transition-colors ${
                                      guests === n ? "bg-cream text-cocoa" : "text-cream/70 hover:text-cream"
                                    }`}
                                  >
                                    {n === 1 ? "Just me" : "Me + 1 guest"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <label className="block">
                            <span className="mb-2 block text-sm font-bold text-cream/70">
                              Mobile number <span className="font-normal text-cream/40">(optional)</span>
                            </span>
                            <input
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91"
                              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-cream placeholder:text-cream/30 focus:border-brand/60 focus:outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-bold text-cream/70">
                              A note for the hosts <span className="font-normal text-cream/40">(optional)</span>
                            </span>
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={3}
                              maxLength={500}
                              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-cream placeholder:text-cream/30 focus:border-brand/60 focus:outline-none"
                            />
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && <p className="mt-5 text-sm text-coral">{error}</p>}

                  <button
                    type="submit"
                    disabled={!choice || busy}
                    className="group relative mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ff7a1a] via-brand to-ember px-8 py-4 font-bold tracking-wide text-white shadow-[0_14px_50px_-10px_rgba(253,41,27,0.9)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:w-auto sm:min-w-64"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {busy && <LoaderCircle className="size-5 animate-spin" />}
                    Send my response
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
