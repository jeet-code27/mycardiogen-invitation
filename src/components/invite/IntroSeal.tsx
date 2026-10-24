"use client";

import { AnimatePresence, motion } from "motion/react";
import Logo from "@/components/Logo";
import { EASE } from "./Reveal";

/** Full-screen "envelope" with a wax seal. Breaking the seal splits the panels open. */
export default function IntroSeal({
  name,
  open,
  onOpen,
}: {
  name: string;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          key="seal"
          className="fixed inset-0 z-50"
          exit={{ pointerEvents: "none" }}
          transition={{ duration: 1.4 }}
        >
          {/* Top and bottom panels slide apart on open */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-ink"
            exit={{ y: "-100%" }}
            transition={{ duration: 1.25, ease: EASE, delay: 0.25 }}
          >
            <div className="absolute inset-x-0 top-0 h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(120,6,4,0.55),transparent_62%)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent shadow-[0_0_12px_rgba(253,41,27,0.55)]" />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-ink"
            exit={{ y: "100%" }}
            transition={{ duration: 1.25, ease: EASE, delay: 0.25 }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(120,6,4,0.55),transparent_62%)]" />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-between px-6 py-10 sm:py-14 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Top section elevated and balanced */}
            <div className="flex flex-1 flex-col items-center justify-end pb-6 sm:pb-8">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                className="text-[11px] font-bold tracking-[0.42em] text-cyan/80 uppercase"
              >
                A personal invitation for
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
                className="text-gradient-cream mt-3 font-serif text-4xl leading-tight sm:text-6xl"
              >
                Dr. {name}
              </motion.h1>
            </div>

            {/* Seal button positioned exactly at the envelope seam (50% vertical center) */}
            <div className="relative shrink-0 flex items-center justify-center">
              <motion.button
                type="button"
                onClick={onOpen}
                initial={{ opacity: 0, scale: 0.6, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="group relative grid size-36 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan sm:size-40"
                aria-label="Open your invitation"
              >
                <span className="absolute inset-0 animate-pulse-ring rounded-full border border-brand/60" />
                <span className="absolute inset-0 animate-pulse-ring rounded-full border border-brand/40 [animation-delay:1.2s]" />
                {/* Wax seal */}
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff5a3c_0%,#d90a0a_38%,#7a0303_78%,#4a0101_100%)] shadow-[0_0_60px_rgba(253,41,27,0.55),inset_0_-8px_18px_rgba(0,0,0,0.45),inset_0_6px_14px_rgba(255,170,140,0.35)]" />
                <span className="absolute inset-[10px] rounded-full border border-dashed border-white/25" />
                <span className="absolute inset-[18px] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.12),transparent_60%)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]" />
                <Logo className="relative h-14 w-auto drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] [filter:brightness(0)_invert(1)_drop-shadow(0_2px_2px_rgba(0,0,0,0.35))]" />
              </motion.button>
            </div>

            {/* Bottom section */}
            <div className="flex flex-1 flex-col items-center justify-start pt-6 sm:pt-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.3 }}
                className="text-sm tracking-wide text-cream/60"
              >
                Tap the seal to open
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
