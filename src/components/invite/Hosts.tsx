"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { HOSTS } from "@/lib/event";
import Reveal, { Eyebrow } from "./Reveal";

function TiltCard({ host }: { host: (typeof HOSTS)[number] }) {
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
              sizes="(min-width: 768px) 420px, 90vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#0b0302_6%,rgba(11,3,2,0.55)_32%,transparent_60%)]" />
            <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8" style={{ transform: "translateZ(40px)" }}>
            <p className="text-[11px] font-bold tracking-[0.32em] text-cyan uppercase">{host.role}</p>
            <h3 className="mt-2 font-serif text-3xl sm:text-4xl">{host.name}</h3>
            {host.detail && <p className="mt-1.5 text-sm text-cream/70">{host.detail}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Hosts() {
  return (
    <section className="relative px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <Eyebrow className="justify-center">Your Hosts</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl sm:text-5xl">
            Hosted by the <span className="text-gradient-red italic">Founders</span>
          </h2>
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2 sm:gap-10">
          {HOSTS.map((h, i) => (
            <Reveal key={h.name} delay={0.12 * i}>
              <TiltCard host={h} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
