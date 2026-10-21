"use client";
/* eslint-disable react-hooks/immutability -- R3F scene code mutates the camera and three.js objects imperatively. */

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import VillaEnvironment from "./VillaEnvironment";
import { useVilla } from "./useVilla";
import VillaLights from "./VillaLights";
import VillaProps from "./VillaProps";
import { openWalkthrough, useWalkthrough, type CameraPose } from "@/lib/villa/walkthroughStore";

const HOUSE_BOUNDS = new THREE.Box3(new THREE.Vector3(-11.4, -0.5, -9.6), new THREE.Vector3(11.4, 9, 9.3));

interface Tier {
  lowPower: boolean;
  reducedMotion: boolean;
}

function HeroVilla({ onReady, tier }: { onReady: () => void; tier: Tier }) {
  const villa = useVilla("static", { shadows: !tier.lowPower, lowPower: tier.lowPower });
  const { camera, size, pointer } = useThree();
  const target = useRef(new THREE.Vector3());

  useEffect(() => onReady(), [onReady]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width < size.height ? 50 : 44;
    cam.updateProjectionMatrix();
  }, [camera, size]);

  useFrame(({ clock }) => {
    const t = tier.reducedMotion ? 0 : clock.getElapsedTime();
    const portrait = size.width < size.height;
    const px = tier.reducedMotion ? 0 : pointer.x, py = tier.reducedMotion ? 0 : pointer.y;
    // Framed like the reference photograph: from the lawn beyond the pool,
    // looking back across the water at the glazed pool facade.
    const drift = Math.sin(t * 0.08) * 0.4;
    const goal = portrait
      ? new THREE.Vector3(-19 + drift, 8.5 + py * 0.15, -31)
      : new THREE.Vector3(-6.2 + drift + px * 0.4, 1.85 + py * 0.15, -23.0);
    camera.position.lerp(goal, tier.reducedMotion ? 1 : 0.05);
    // portrait: raised three-quarter view so the whole house sits above the headline
    target.current.set(portrait ? 1 : 4.6, portrait ? -1.5 : 3.3, portrait ? -3 : -6.5);
    camera.lookAt(target.current);
  });
  const onDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!HOUSE_BOUNDS.containsPoint(e.point)) return;
    e.stopPropagation();
    const from: CameraPose = {
      position: camera.position.toArray() as CameraPose["position"],
      target: target.current.toArray() as CameraPose["target"],
    };
    openWalkthrough({ kind: "entrance", source: "hero", from });
  };

  return (
    <>
    <VillaLights lights={villa.lights} />
    <Suspense fallback={null}>
      <VillaProps villa={villa} lowPower={tier.lowPower} />
    </Suspense>
    <primitive
      object={villa.root}
      onDoubleClick={onDoubleClick}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        if (HOUSE_BOUNDS.containsPoint(e.point)) document.body.style.cursor = "zoom-in";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    />
    </>
  );
}

export default function HeroVillaCanvas({ onReady, onProgress, tier }: { onReady: () => void; onProgress?: (p: number) => void; tier: Tier }) {
  const { progress } = useProgress();
  useEffect(() => onProgress?.(progress), [progress, onProgress]);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const { open } = useWalkthrough();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        shadows={!tier.lowPower}
        dpr={tier.lowPower ? [1, 1.25] : [1, 1.75]}
        frameloop={visible && !open ? (tier.reducedMotion ? "demand" : "always") : "never"}
        camera={{ position: [-6.2, 1.85, -23], fov: 44, near: 0.1, far: 900 }}
        gl={{ antialias: !tier.lowPower, powerPreference: "high-performance" }}
        aria-hidden
      >
        <Suspense fallback={null}>
          <VillaEnvironment shadowSize={tier.lowPower ? 1024 : 2048} ao={tier.lowPower ? "off" : "full"} />
          <HeroVilla onReady={onReady} tier={tier} />
        </Suspense>
      </Canvas>
    </div>
  );
}
