"use client";

import Reveal, { Eyebrow } from "./Reveal";
import VideoPlayer from "./VideoPlayer";

export default function VideoSection({ videoUrl }: { videoUrl: string }) {
  return (
    <section id="video" className="relative px-6 py-16 sm:px-10 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(93,0,0,0.35),transparent_60%)]" />
      <div className="relative mx-auto max-w-5xl">
        <Reveal className="text-center">
          <Eyebrow className="justify-center">A Personal Note</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl sm:text-5xl">A Message from Our Founders</h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
          <VideoPlayer videoUrl={videoUrl} />
        </Reveal>
      </div>
    </section>
  );
}
