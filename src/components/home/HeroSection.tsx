"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { openWalkthrough, useWalkthrough } from "@/lib/villa/walkthroughStore";
import SceneLabel from "./SceneLabel";
import { hasWebGL, isLowPowerDevice, prefersReducedMotion } from "@/lib/device";

// The live hero renders the same villa model used by the assembly and the walkthrough.
const HeroVillaCanvas = dynamic(() => import("@/components/villa/HeroVillaCanvas"), { ssr: false });

type Tier = { lowPower: boolean; reducedMotion: boolean };

export default function HeroSection() {
  const [tier, setTier] = useState<Tier | null>(null);
  // phones keep the photograph until the visitor asks for 3D
  const [show3d, setShow3d] = useState(false);
  const [ready, setReady] = useState(false);
  const { lastPose, open } = useWalkthrough();
  const onReady = useCallback(() => setReady(true), []);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!hasWebGL()) return; // photograph stays; the tour button explains why it's unavailable
    const start = () => {
      const lowPower = isLowPowerDevice();
      setTier({ lowPower, reducedMotion: prefersReducedMotion() });
      if (!lowPower) setShow3d(true);
    };
    // Let the page become interactive before the 3D bundle and model load.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 1200);
  }, []);

  const tourAvailable = tier !== null;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[100svh] w-full flex flex-col justify-between pt-24 pb-10 overflow-hidden bg-charcoal-dark select-none"
    >
      <div className="absolute inset-0 z-0">
        {/* Reference photograph: shown immediately, and as the fallback without WebGL */}
        <Image
          src="/images/reference/villa-exterior-pool.jpg"
          alt="Modern two-storey villa with white rendered volumes, timber cladding and floor-to-ceiling glazing behind an infinity pool and lawn"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_50%]"
        />
        {/* unmounted during the tour so only one WebGL context holds the model */}
        {tier && show3d && !open && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <HeroVillaCanvas onReady={onReady} onProgress={setProgress} tier={tier} />
          </div>
        )}
        {/* two overlays: one for the headline side, one for the nav */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-dark/95 via-charcoal-dark/50 to-transparent sm:bg-gradient-to-r sm:from-charcoal-dark/90 sm:via-charcoal-dark/40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-charcoal-dark/70 to-transparent" />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 mt-auto sm:my-auto py-10">
        <div className="max-w-xl">
          <div className="intro mb-5"><SceneLabel n="01">The residence</SceneLabel></div>
          <h1 id="hero-heading" className="intro text-[2.75rem] leading-[1.04] sm:text-6xl lg:text-[5.25rem] text-linen mb-6" style={{ animationDelay: "120ms" }}>
            Spaces That Shape a Better Tomorrow
          </h1>
          <p className="intro text-lg text-linen-muted leading-relaxed max-w-lg mb-9" style={{ animationDelay: "240ms" }}>
            Considered homes in white render, warm timber and glass — explore one room by room before you visit.
          </p>

          <div className="intro pointer-events-auto flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: "360ms" }}>
            <Link href="/residential" className="btn-copper">
              Explore properties
            </Link>
            <button
              type="button"
              onClick={() => openWalkthrough(lastPose ? { kind: "resume", pose: lastPose } : { kind: "entrance", source: "hero" })}
              disabled={!tourAvailable}
              className="text-base text-linen underline decoration-winter underline-offset-[6px] hover:text-winter disabled:opacity-50"
            >
              {lastPose ? "Resume the tour" : "Enter the house"}
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between px-4 sm:px-6">
        <p className="label text-linen-muted" aria-live="polite">
          {!tourAvailable ? (
            "3D needs WebGL, which is unavailable here"
          ) : !show3d ? (
            <button type="button" onClick={() => setShow3d(true)} className="pointer-events-auto label text-linen underline decoration-winter underline-offset-[6px]">
              View the house in 3D
            </button>
          ) : ready ? (
            "Double-click the house to explore it"
          ) : (
            `Preparing the 3D house · ${Math.round(progress)}%`
          )}
        </p>
      </div>
    </section>
  );
}
