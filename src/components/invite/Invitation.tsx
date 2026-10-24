"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PublicDoctor } from "@/lib/types";
import { EVENT } from "@/lib/event";
import Logo from "@/components/Logo";
import IntroSeal from "./IntroSeal";
import Hero from "./Hero";
import Launch from "./Launch";
import VideoSection from "./VideoSection";
import Hosts from "./Hosts";
import EventDetails from "./EventDetails";
import Rsvp from "./Rsvp";
import Reveal from "./Reveal";

export default function Invitation({
  doctor,
  videoUrl,
  eventTime,
}: {
  doctor: PublicDoctor;
  videoUrl: string;
  eventTime: string;
}) {
  const [opened, setOpened] = useState(false);
  const [showRsvpPill, setShowRsvpPill] = useState(false);

  // Keep the page locked behind the seal until it is opened.
  useEffect(() => {
    history.scrollRestoration = "manual";
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [opened]);

  // Floating RSVP shortcut: visible after the hero, hidden once the RSVP card is on screen.
  useEffect(() => {
    if (!opened) return;
    const rsvp = document.getElementById("rsvp");
    let rsvpVisible = false;
    const update = () => setShowRsvpPill(window.scrollY > window.innerHeight * 0.8 && !rsvpVisible);
    const io = new IntersectionObserver(([e]) => {
      rsvpVisible = e.isIntersecting;
      update();
    });
    if (rsvp) io.observe(rsvp);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [opened]);

  function open() {
    window.scrollTo({ top: 0 });
    setOpened(true);
    fetch("/api/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: doctor.slug }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <main className="grain relative overflow-x-clip">
      <IntroSeal name={doctor.name} open={opened} onOpen={open} />

      <Hero name={doctor.name} opened={opened} />
      <VideoSection videoUrl={videoUrl} />
      <Launch />
      <Hosts />
      <EventDetails eventTime={eventTime} />
      <Rsvp doctor={doctor} eventTime={eventTime} />

      <footer className="relative px-6 pt-10 pb-16 text-center sm:px-10">
        <Reveal>
          <p className="font-serif text-lg text-cream/60 italic">With warm regards,</p>
          <p className="mt-3 font-serif text-2xl sm:text-3xl">Dr. Anand Singla &amp; Dr. Sonam Chouksey</p>
          <p className="mt-1 text-sm tracking-wide text-cream/50">Co-founders, MyCardioGen</p>
          <div className="hairline mx-auto my-10 max-w-md" />
          <Logo className="mx-auto h-12 w-auto opacity-90" />
          <a
            href={EVENT.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-cream/40 hover:text-cream/80"
          >
            www.mycardiogen.com
          </a>

          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] tracking-wide text-cream/35">
            <span>Powered by</span>
            <a
              href="https://bizboxstory.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/bizbox-logo.png"
                alt="Bizbox Story"
                className="h-3.5 w-auto object-contain brightness-110"
              />
              <span className="font-medium text-cream/60">bizboxstory</span>
            </a>
          </div>
        </Reveal>
      </footer>

      <AnimatePresence>
        {showRsvpPill && (
          <motion.a
            href="#rsvp"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed right-5 bottom-5 z-40 rounded-full bg-gradient-to-r from-[#ff7a1a] to-ember px-6 py-3 text-sm font-bold text-white shadow-[0_10px_40px_-6px_rgba(253,41,27,0.9)]"
          >
            RSVP
          </motion.a>
        )}
      </AnimatePresence>
    </main>
  );
}
