"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ChevronUp, X } from "lucide-react";
import { HOSTS } from "@/lib/event";
import Reveal, { EASE, Eyebrow } from "./Reveal";

type Host = (typeof HOSTS)[number] & { bio?: string };

function TiltCard({ host }: { host: Host }) {
  const [showBio, setShowBio] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 15 });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.22), transparent 50%)`,
  );

  return (
    <div className="[perspective:1100px]">
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative rounded-[30px] bg-gradient-to-b from-brand/60 via-white/10 to-cyan/30 p-px shadow-[0_40px_100px_-40px_rgba(253,41,27,0.6)]"
      >
        <div className="relative overflow-hidden rounded-[29px] bg-ink-2">
          <div className="relative aspect-[4/5]">
            <Image
              src={host.photo}
              alt={host.name}
              fill
              sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 90vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#0b0302_6%,rgba(11,3,2,0.55)_32%,transparent_60%)]" />
            <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8" style={{ transform: "translateZ(40px)" }}>
            <p className="text-[11px] font-bold tracking-[0.32em] text-cyan uppercase">{host.role}</p>
            <h3 className="mt-2 font-serif text-3xl">{host.name}</h3>
            {host.detail && <p className="mt-1.5 text-sm text-cream/70">{host.detail}</p>}
            {host.bio && (
              <button
                type="button"
                onClick={() => setShowBio(true)}
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-cream backdrop-blur transition-colors hover:border-cyan/60 hover:text-cyan"
              >
                Read bio <ChevronUp className="size-3.5" />
              </button>
            )}
          </div>

          {/* Bio slides up over the photo so every card keeps the same height. */}
          <AnimatePresence>
            {showBio && host.bio && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.55, ease: EASE }}
                className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-[linear-gradient(170deg,rgba(28,7,5,0.96),rgba(11,3,2,0.97))] p-6 backdrop-blur-md sm:p-8"
              >
                <button
                  type="button"
                  onClick={() => setShowBio(false)}
                  className="absolute top-4 right-4 grid size-9 cursor-pointer place-items-center rounded-full bg-white/10 text-cream/80 transition-colors hover:bg-white/20 hover:text-cream"
                  aria-label="Close bio"
                >
                  <X className="size-4" />
                </button>
                <p className="text-[11px] font-bold tracking-[0.32em] text-cyan uppercase">{host.role}</p>
                <h3 className="mt-2 pr-10 font-serif text-2xl">{host.name}</h3>
                <div className="hairline my-5 w-24" />
                <p className="text-sm leading-relaxed text-cream/75">{host.bio}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function Hosts() {
  return (
    <section className="relative px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <Eyebrow className="justify-center">Your Hosts</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl sm:text-5xl">
            Hosted by our <span className="text-gradient-red italic">Leadership</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-md gap-10 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {(HOSTS as readonly Host[]).map((h, i) => (
            <Reveal key={h.name} delay={0.12 * i}>
              <TiltCard host={h} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
