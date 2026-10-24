"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";

export const card =
  "rounded-[24px] border border-cocoa/10 bg-white/85 shadow-[0_20px_60px_-35px_rgba(47,15,3,0.35)] backdrop-blur-xl";
export const input =
  "w-full rounded-xl border border-cocoa/15 bg-white px-4 py-3 text-cocoa placeholder:text-cocoa/35 focus:border-teal focus:ring-4 focus:ring-teal/15 focus:outline-none";
export const primaryBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a1a] to-ember px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-12px_rgba(253,41,27,0.9)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";
export const ghostBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-cocoa/15 bg-white px-4 py-2 text-sm font-bold text-cocoa/80 transition-colors hover:border-cocoa/30 hover:text-cocoa disabled:opacity-50";
export const iconBtn =
  "grid size-9 cursor-pointer place-items-center rounded-full text-cocoa/55 transition-colors hover:bg-cocoa/5 hover:text-cocoa";

type Toast = { id: number; text: string; tone: "ok" | "error" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  return (
    <ToastCtx value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2 rounded-full bg-cocoa px-5 py-3 text-sm font-bold text-cream shadow-xl"
            >
              {t.tone === "ok" ? (
                <CircleCheck className="size-4 text-mint" />
              ) : (
                <CircleX className="size-4 text-coral" />
              )}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx>
  );
}
