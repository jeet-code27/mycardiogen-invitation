import HeartSceneLazy from "@/components/three/HeartSceneLazy";
import Logo from "@/components/Logo";
import Ecg from "@/components/Ecg";
import { EVENT } from "@/lib/event";

export default function Home() {
  return (
    <main className="grain relative flex min-h-svh flex-col items-center justify-between overflow-hidden px-6 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(93,0,0,0.55),transparent_60%)]" />
      <HeartSceneLazy layout="center" className="absolute inset-0" />

      <Logo className="relative h-12 w-auto" />

      <div className="relative mt-auto">
        <p className="text-xs tracking-[0.45em] text-cyan/80 uppercase">By invitation only</p>
        <h1 className="mt-4 font-serif text-5xl leading-none sm:text-7xl">
          MyCardio<span className="text-gradient-red">Gen</span>
        </h1>
        <p className="mt-3 font-serif text-xl text-cream/80 italic sm:text-2xl">India Launch</p>
        <Ecg className="mx-auto my-6 h-10 w-72 sm:w-96" />
        <p className="text-sm tracking-wide text-cream/70">
          {EVENT.dateLong} · {EVENT.venueFull}
        </p>
        <p className="mx-auto mt-6 max-w-sm text-sm text-cream/50">
          Invitations are personal. Please open the link that was shared with you.
        </p>

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
      </div>
    </main>
  );
}
