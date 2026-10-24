"use client";

import { motion } from "motion/react";
import { ArrowDown, CalendarDays, MapPin } from "lucide-react";
import HeartSceneLazy from "@/components/three/HeartSceneLazy";
import Logo from "@/components/Logo";
import { EVENT } from "@/lib/event";
import { EASE } from "./Reveal";

export default function Hero({ name, opened }: { name: string; opened: boolean }) {
  const item = (delay: number) => ({
    initial: { opacity: 0, y: 26, filter: "blur(8px)" },
    animate: opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1.1, ease: EASE, delay: 0.9 + delay },
  });

  return (
    <section className="relative min-h-svh overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(120,6,4,0.55),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(33,134,141,0.14),transparent_45%)]" />
      <HeartSceneLazy active={opened} layout="side" className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />

      <motion.header
        {...item(-0.3)}
        className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 pt-6 sm:px-10"
      >
        <Logo className="h-11 w-auto sm:h-12" />
        <span className="glass rounded-full px-4 py-1.5 text-[10px] font-bold tracking-[0.3em] text-cream/80 uppercase sm:text-[11px]">
          India Launch · 28.11.26
        </span>
      </motion.header>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-90px)] max-w-7xl items-end px-6 pb-24 sm:px-10 md:items-center md:pb-16">
        <div className="pointer-events-auto max-w-xl pt-[40svh] md:pt-0">
          <motion.p {...item(0)} className="font-serif text-2xl text-cream/70 italic sm:text-3xl">
            Dear
          </motion.p>
          <motion.h1
            {...item(0.12)}
            className="text-gradient-cream mt-1 font-serif text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Dr. {name},
          </motion.h1>

          <motion.p {...item(0.3)} className="mt-6 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
            It is our privilege to invite you to the India launch of
          </motion.p>

          <motion.h2 {...item(0.42)} className="mt-2 font-serif text-5xl leading-none sm:text-7xl">
            MyCardio<span className="text-gradient-red">Gen</span>
          </motion.h2>
          <motion.p {...item(0.5)} className="mt-3 font-serif text-lg text-cream/85 sm:text-xl">
            A Paradigm Shift in Preventive Heart Screening
          </motion.p>

          <motion.div {...item(0.62)} className="mt-7 flex flex-wrap gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-cream/90">
              <CalendarDays className="size-4 text-brand" />
              Sat, 28 November 2026
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-cream/90">
              <MapPin className="size-4 text-cyan" />
              {EVENT.venueName}, New Delhi
            </span>
          </motion.div>

          <motion.div {...item(0.74)} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#rsvp"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ff7a1a] via-brand to-ember px-7 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_10px_40px_-8px_rgba(253,41,27,0.8)] transition-transform hover:scale-[1.03]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              RSVP Now
            </a>
            <a href="#details" className="text-sm font-bold tracking-wide text-cream/80 underline-offset-4 hover:text-cream hover:underline">
              Event details
            </a>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#video"
        {...item(1)}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream/50 hover:text-cream"
        aria-label="Scroll down"
      >
        <ArrowDown className="size-5 animate-float" />
      </motion.a>
    </section>
  );
}
