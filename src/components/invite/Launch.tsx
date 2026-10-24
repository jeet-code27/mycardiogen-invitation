/* eslint-disable @next/next/no-img-element -- small brand SVG icons */
import Ecg from "@/components/Ecg";
import Reveal, { Eyebrow } from "./Reveal";

const PILLARS = [
  { icon: "/brand/icon-blood.svg", title: "Blood Test", text: "Advanced cardiac biomarkers", tint: "bg-[#ffe1e1]" },
  { icon: "/brand/icon-genetic.svg", title: "Genetic Testing", text: "Your inherited heart-risk profile", tint: "bg-[#e8d9ff]" },
  { icon: "/brand/icon-ct.svg", title: "Coronary CT Scan", text: "A clear view of the arteries", tint: "bg-[#c2f9fb]" },
  { icon: "/brand/icon-doctor.svg", title: "Doctor Consultation", text: "Personalised expert guidance", tint: "bg-[#ffe7cd]" },
];

export default function Launch() {
  return (
    <section id="launch" className="relative px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <Eyebrow className="justify-center">The Occasion</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">
            An evening dedicated to the{" "}
            <span className="text-gradient-red italic">future of heart health</span> in India
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-cream/75">
            Join us for MyCardioGen&apos;s India launch on{" "}
            <strong className="font-bold text-cream">Saturday, 28 November</strong> at{" "}
            <strong className="font-bold text-cream">Le Méridien, New Delhi</strong>.
          </p>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-cream/60">
            MyCardioGen brings an integrated, all-in-one diagnostic approach to personalised heart-risk
            prediction, designed for the Indian population.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <Ecg className="mx-auto my-14 h-12 w-full max-w-3xl" />
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={0.08 * i}>
              <div className="glass group h-full rounded-3xl p-5 text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_20px_60px_-20px_rgba(253,41,27,0.5)] sm:p-6">
                <span className={`grid size-12 place-items-center rounded-2xl ${p.tint} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <img src={p.icon} alt="" className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-lg leading-snug sm:text-xl">{p.title}</h3>
                <p className="mt-1.5 text-sm text-cream/55">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
