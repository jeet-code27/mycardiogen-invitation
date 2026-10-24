"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { parseVideo } from "@/lib/video";
import Reveal, { Eyebrow } from "./Reveal";

export default function VideoSection({ videoUrl }: { videoUrl: string }) {
  const video = parseVideo(videoUrl);
  const [playing, setPlaying] = useState(false);

  return (
    <section id="video" className="relative px-6 py-16 sm:px-10 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(93,0,0,0.35),transparent_60%)]" />
      <div className="relative mx-auto max-w-5xl">
        <Reveal className="text-center">
          <Eyebrow className="justify-center">A Personal Note</Eyebrow>
          <h2 className="mt-6 font-serif text-3xl sm:text-5xl">A Message from Our Founders</h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
          <div className="relative rounded-[28px] bg-gradient-to-br from-brand/70 via-white/10 to-cyan/40 p-px shadow-[0_40px_120px_-30px_rgba(253,41,27,0.55)]">
            <div className="relative aspect-video overflow-hidden rounded-[27px] bg-ink-2">
              {playing && video?.kind === "iframe" && (
                <iframe
                  src={video.src}
                  title="A message from the MyCardioGen founders"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 size-full"
                />
              )}
              {playing && video?.kind === "file" && (
                <video
                  src={video.src}
                  poster={video.thumb}
                  controls
                  autoPlay
                  playsInline
                  className="absolute inset-0 size-full bg-black object-contain"
                />
              )}

              {!playing && (
                <button
                  type="button"
                  disabled={!video}
                  onClick={() => setPlaying(true)}
                  className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center disabled:cursor-default"
                  aria-label={video ? "Play video" : "Video coming soon"}
                >
                  {video?.thumb ? (
                    <span
                      className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${video.thumb})` }}
                    />
                  ) : (
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(253,41,27,0.35),transparent_55%),linear-gradient(135deg,#1a0605,#0b0302_60%,#081a1b)]" />
                  )}
                  <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,3,2,0.85),transparent_55%)]" />

                  <span className="relative grid size-20 place-items-center sm:size-24">
                    {video && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/40" />}
                    <span className="relative grid size-full place-items-center rounded-full bg-gradient-to-br from-[#ff7a1a] to-ember shadow-[0_0_50px_rgba(253,41,27,0.7)] transition-transform duration-500 group-hover:scale-110 group-disabled:from-white/15 group-disabled:to-white/5 group-disabled:shadow-none">
                      <Play className="ml-1 size-8 fill-white text-white sm:size-9" />
                    </span>
                  </span>
                  <span className="relative mt-6 font-serif text-xl sm:text-2xl">
                    {video ? "Watch the message" : "Video message coming soon"}
                  </span>
                  <span className="relative mt-1 text-sm text-cream/55">
                    Dr. Anand Singla &amp; Dr. Sonam Chouksey
                  </span>
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
