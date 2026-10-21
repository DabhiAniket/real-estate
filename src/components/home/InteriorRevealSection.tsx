"use client";

import Image from "next/image";
import { openWalkthrough, type TourPose } from "@/lib/villa/walkthroughStore";
import SceneLabel from "./SceneLabel";
import Reveal from "@/components/Reveal";

interface Room {
  image: string;
  alt: string;
  title: string;
  note: string;
  /** Where the walkthrough starts when the visitor steps into this room. */
  pose: TourPose;
}

const GF = 0.45;
const FF = 3.85;

const ROOMS: Room[] = [
  {
    image: "/images/reference/interior-living-dining.jpg",
    alt: "Open-plan living and dining room with a gas fireplace, cream carpet, a round timber dining table and six linen chairs",
    title: "Living & dining",
    note: "Fireplace wall, tray ceiling and a round table for six, opening to the pool terrace.",
    pose: { feet: [7.7, GF, 5.7], yaw: 0.77, pitch: -0.05 },
  },
  {
    image: "/images/reference/interior-bedroom-fan.jpg",
    alt: "Bright bedroom with white bedding, black bedside tables, abstract artwork above the bed, a ceiling fan and a blue velvet armchair",
    title: "Bedroom two",
    note: "Charcoal carpet, ceiling fan and a quiet reading chair beside the window.",
    pose: { feet: [-4.1, FF, 3.4], yaw: 1.75, pitch: -0.05 },
  },
  {
    image: "/images/reference/interior-bedroom-teal.jpg",
    alt: "Bedroom with an upholstered grey headboard, black-shade lamps on gold side tables, a teal throw and framed geometric artwork",
    title: "Principal suite",
    note: "Upholstered headboard, gold side tables and a teal throw; dressing room and bath beyond.",
    pose: { feet: [7.6, FF, 3.0], yaw: 1.96, pitch: -0.05 },
  },
];

export default function InteriorRevealSection() {
  return (
    <section aria-labelledby="interiors-heading" className="bg-charcoal py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-2xl mb-12 sm:mb-16">
          <SceneLabel n="05">Interiors</SceneLabel>
          <h2 id="interiors-heading" className="mt-4 text-4xl sm:text-6xl text-linen leading-tight">
            Rooms you can walk into
          </h2>
          <p className="mt-5 text-base sm:text-lg text-linen-muted leading-relaxed">
            The finishes and furniture of the 3D house follow these rooms. Step into one and continue on foot.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-12">
          {ROOMS.map((room, i) => (
            <Reveal as="figure" key={room.title} delay={i === 2 ? 120 : 0} className={i === 0 ? "lg:col-span-12" : "lg:col-span-6"}>
              <div className={`relative overflow-hidden bg-charcoal-dark ${i === 0 ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[3/2]"}`}>
                <Image
                  src={room.image}
                  alt={room.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 1280px) 1232px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-md">
                  <h3 className="text-3xl text-linen">{room.title}</h3>
                  <p className="mt-2 text-base text-linen-muted leading-relaxed">{room.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openWalkthrough({ kind: "resume", pose: room.pose })}
                  className="text-base text-linen underline decoration-winter underline-offset-[6px] hover:text-winter"
                >
                  Step inside in 3D →
                </button>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
