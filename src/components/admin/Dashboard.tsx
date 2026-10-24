"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, Eye, Hourglass, LogOut, RotateCcw, Users } from "lucide-react";
import type { Doctor, Settings } from "@/lib/types";
import { EVENT } from "@/lib/event";
import Logo from "@/components/Logo";
import AddDoctors from "./AddDoctors";
import SettingsCard from "./SettingsCard";
import GuestList from "./GuestList";
import { ToastProvider, card, ghostBtn } from "./ui";

const noopSubscribe = () => () => {};

export default function Dashboard({
  initialDoctors,
  initialSettings,
  storageError,
}: {
  initialDoctors: Doctor[];
  initialSettings: Settings;
  storageError: string;
}) {
  const router = useRouter();
  const [doctors, setDoctors] = useState(initialDoctors);
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    const res = await fetch("/api/admin/doctors", { cache: "no-store" });
    if (res.ok) setDoctors((await res.json()).doctors);
    setRefreshing(false);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const attending = doctors.filter((d) => d.rsvp?.status === "attending");
  const headcount = attending.reduce((n, d) => n + (d.rsvp?.guests ?? 1), 0);
  const stats = [
    { label: "Invited", value: doctors.length, Icon: Users, tone: "text-cocoa bg-cocoa/5" },
    { label: "Opened", value: doctors.filter((d) => d.firstOpenedAt).length, Icon: Eye, tone: "text-[#a3520c] bg-[#ffe7cd]" },
    {
      label: "Attending",
      value: attending.length,
      sub: `${headcount} ${headcount === 1 ? "person" : "people"} in total`,
      Icon: CircleCheck,
      tone: "text-teal bg-teal/10",
    },
    { label: "Declined", value: doctors.filter((d) => d.rsvp?.status === "declined").length, Icon: CircleX, tone: "text-cocoa/60 bg-cocoa/5" },
    { label: "Awaiting reply", value: doctors.filter((d) => !d.rsvp).length, Icon: Hourglass, tone: "text-blood bg-blush/60" },
  ];

  return (
    <ToastProvider>
      <main className="relative min-h-svh overflow-hidden bg-cream pb-20 text-cocoa">
        <div className="pointer-events-none absolute -top-60 -right-40 size-[620px] rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute top-96 -left-60 size-[620px] rounded-full bg-teal/10 blur-3xl" />

        <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <Logo variant="dark" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <p className="font-serif text-lg leading-tight">Invitation Console</p>
                <p className="text-xs text-cocoa/55">
                  India Launch · {EVENT.dateLong}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={refresh} className={ghostBtn} title="Refresh RSVPs">
                <RotateCcw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button type="button" onClick={logout} className={ghostBtn}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="relative mx-auto max-w-6xl px-5 pt-8 sm:px-8">
          {storageError && (
            <div className="mb-6 rounded-2xl border border-ember/30 bg-ember/5 p-4 text-sm text-ember">
              {storageError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {stats.map(({ label, value, sub, Icon, tone }) => (
              <div key={label} className={`${card} flex items-start gap-3 p-4 sm:p-5`}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-3xl leading-none">{value}</p>
                  <p className="mt-1.5 text-sm font-bold text-cocoa/60">{label}</p>
                  {sub && <p className="text-xs text-cocoa/45">{sub}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <AddDoctors origin={origin} onCreated={(created) => setDoctors((d) => [...created.reverse(), ...d])} />
            <SettingsCard initial={initialSettings} />
          </div>

          <div className="mt-6">
            <GuestList
              doctors={doctors}
              origin={origin}
              onChange={(doc) => setDoctors((ds) => ds.map((d) => (d.slug === doc.slug ? doc : d)))}
              onRemove={(slug) => setDoctors((ds) => ds.filter((d) => d.slug !== slug))}
            />
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}
