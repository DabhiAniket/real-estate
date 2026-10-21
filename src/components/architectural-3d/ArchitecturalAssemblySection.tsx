"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STAGES } from "@/lib/villa/stages";
import Image from "next/image";
import { openWalkthrough, useWalkthrough } from "@/lib/villa/walkthroughStore";
import { hasWebGL } from "@/lib/device";
import SceneLabel from "@/components/home/SceneLabel";

const AssemblyScene = dynamic(() => import("@/components/villa/AssemblyScene"), { ssr: false });

function stageIndexAt(p: number) {
  const i = STAGES.findIndex((s) => p >= s.range[0] && p < s.range[1]);
  return i === -1 ? STAGES.length - 1 : i;
}

export default function ArchitecturalAssemblySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [percent, setPercent] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [near, setNear] = useState(false);
  const { open } = useWalkthrough();
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!hasWebGL()) queueMicrotask(() => setWebgl(false));
    const container = containerRef.current;
    if (!container) return;
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // Forward scroll builds the house, backward scroll takes it apart again.
        progressRef.current = self.progress;
        setPercent(Math.round(self.progress * 100));
        setStageIndex(stageIndexAt(self.progress));
      },
    });
    // Mount the 3D scene once the visitor has scrolled into the section (not on
    // page load, so the hero stays light), and keep it while the section is near.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setNear(true);
      else if (e.boundingClientRect.top > window.innerHeight * 1.5 || e.boundingClientRect.bottom < -window.innerHeight) setNear(false);
    }, { rootMargin: "0px 0px -30% 0px" });
    io.observe(container);
    return () => {
      trigger.kill();
      io.disconnect();
    };
  }, []);

  const stage = STAGES[stageIndex];
  const reveal = stage.id === "complete";

  return (
    <section ref={containerRef} id="architectural-assembly" aria-labelledby="build-heading" className="relative h-[720vh] w-full bg-charcoal-dark">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          {webgl ? (
            near && !open && <AssemblyScene progressRef={progressRef} onReady={onReady} />
          ) : (
            <Image src="/images/reference/villa-exterior-pool.jpg" alt="The completed villa from across the pool" fill sizes="100vw" className="object-cover" />
          )}
          {webgl && !ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal-dark">
              <span className="font-mono text-xs uppercase tracking-widest text-linen-muted">Loading the model…</span>
            </div>
          )}
        </div>
        {/* scrims keep the copy readable over bright render and lawn */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-charcoal-dark/90 via-charcoal-dark/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/75 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
          <SceneLabel n={reveal ? "03" : "02"}>{reveal ? "The reveal" : "The build"}</SceneLabel>
          <h2 id="build-heading" className="mt-3 font-serif text-3xl font-light text-linen sm:text-5xl">
            {reveal ? "Built, finished, furnished" : "From vision to reality"}
          </h2>
        </div>

        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-md" aria-live="polite">
              <p className="label text-linen-muted">
                {String(stageIndex + 1).padStart(2, "0")} / {STAGES.length}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-linen sm:text-3xl">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-linen-muted sm:text-base">{stage.detail}</p>
            </div>
            {reveal && (
              <button
                type="button"
                onClick={() => openWalkthrough({ kind: "entrance", source: "assembly" })}
                disabled={!webgl}
                className="btn-copper disabled:opacity-50"
              >
                Walk through this house
              </button>
            )}
          </div>
          <div className="mt-6 h-px w-full bg-stone-subtle" role="progressbar" aria-label="Construction progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-px bg-winter" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
