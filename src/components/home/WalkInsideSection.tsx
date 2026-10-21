"use client";

import Image from "next/image";
import SceneLabel from "./SceneLabel";
import Reveal from "@/components/Reveal";
import { openWalkthrough } from "@/lib/villa/walkthroughStore";

export default function WalkInsideSection() {
  return (
    <section aria-labelledby="walk-heading" className="relative isolate flex min-h-[85svh] items-end overflow-hidden">
      <Image
        src="/images/reference/interior-living-dining.jpg"
        alt="Living room with a fireplace opening onto a dining area with a round table"
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/55 to-charcoal-dark/10" />
      <Reveal className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <SceneLabel n="04">Walk inside</SceneLabel>
        <h2 id="walk-heading" className="mt-4 max-w-2xl text-4xl leading-tight text-linen sm:text-6xl">
          Through the front door, on foot.
        </h2>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-linen-muted sm:text-lg">
          Both floors, the stair, every bedroom and bath, the terraces and the garden — connected by real doorways.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button type="button" onClick={() => openWalkthrough({ kind: "entrance", source: "assembly" })} className="btn-copper">
            Enter the house
          </button>
          <span className="label">WASD · mouse · touch</span>
        </div>
      </Reveal>
    </section>
  );
}
