"use client";
/* eslint-disable react-hooks/immutability -- R3F scene code mutates three.js objects, door state and input refs imperatively inside useFrame and event handlers. */

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import VillaEnvironment from "./VillaEnvironment";
import { useVilla } from "./useVilla";
import VillaLights from "./VillaLights";
import VillaProps from "./VillaProps";
import { STAGES, type StageId } from "@/lib/villa/stages";
import type { ElementInfo } from "@/lib/villa/model";
import { useWalkthrough } from "@/lib/villa/walkthroughStore";
import { isLowPowerDevice, prefersReducedMotion } from "@/lib/device";

interface Scheduled {
  el: ElementInfo;
  start: number;
  end: number;
  drop: number;
  always: boolean;
  until?: number;
}

const SPLIT_BY_FLOOR: StageId[] = ["interior-fitout", "furniture-and-lighting"];

function schedule(elements: ElementInfo[]): Scheduled[] {
  const out: Scheduled[] = [];
  for (const stage of STAGES) {
    const [a, b] = stage.range;
    const els = elements.filter((e) => e.stage === stage.id);
    const order = (x: ElementInfo, y: ElementInfo) =>
      x.seq - y.seq || Math.round((x.minY - y.minY) * 5) || x.center.x - y.center.x || y.center.z - x.center.z;
    const assign = (list: ElementInfo[], s0: number, s1: number) => {
      list.sort(order);
      const n = list.length;
      const span = s1 - s0;
      list.forEach((el, i) => {
        const start = n > 1 ? s0 + span * 0.62 * (i / (n - 1)) : s0;
        const end = n > 1 ? start + span * 0.38 : s1;
        const always = stage.id === "site-and-terrain" && el.seq === 0;
        out.push({ el, start, end, drop: stage.drop, always, until: stage.until });
      });
    };
    if (SPLIT_BY_FLOOR.includes(stage.id)) {
      const mid = (a + b) / 2;
      assign(els.filter((e) => e.floor !== 1), a, mid);
      assign(els.filter((e) => e.floor === 1), mid, b);
    } else {
      assign(els, a, b);
    }
  }
  return out;
}

// Height of the horizontal section cut (only inside the house footprint):
// ground floor revealed while its interiors arrive, then the upper floor.
const CUT: [number, number][] = [
  [0.625, 8.4], [0.64, 3.0], [0.69, 3.0], [0.7, 6.5], [0.74, 6.5],
  [0.745, 3.0], [0.785, 3.0], [0.795, 6.5], [0.835, 6.5], [0.852, 8.6],
];
function cutHeight(p: number) {
  if (p < CUT[0][0] || p > CUT[CUT.length - 1][0]) return 1000;
  for (let i = 1; i < CUT.length; i++) {
    const [p0, y0] = CUT[i - 1], [p1, y1] = CUT[i];
    if (p <= p1) return y0 + (y1 - y0) * ((p - p0) / (p1 - p0));
  }
  return 1000;
}

// Camera path: [progress, azimuth, radius, height, targetY, targetZ, targetX].
// It reaches the reference-photo viewpoint across the pool, then dollies in
// on the facade materials (the "reveal").
const CAM: number[][] = [
  [0.0, 0.3, 30, 44, 0, -2, 0],
  [0.05, 0.45, 40, 30, 0, -2, 0],
  [0.11, 0.62, 40, 23, 0, 0, 0],
  [0.17, 0.7, 34, 17, 0.3, 0, 0],
  [0.22, 0.78, 31, 14, 1, 0, 0],
  [0.28, 0.85, 30, 12.5, 2, 0, 0],
  [0.35, 0.92, 30, 12, 2.6, 0, 0],
  [0.42, 0.95, 30, 12, 3, 0, 0],
  [0.49, 0.8, 29, 11, 3.2, 0, 0],
  [0.57, 0.62, 31, 11, 3.6, 0, 0],
  [0.64, 0.4, 22, 22, 1.5, -0.5, 0],
  [0.74, 0.0, 21, 23, 2.5, -0.5, 0],
  [0.84, -0.45, 24, 19, 3.5, 0, 0],
  [0.89, -1.7, 31, 10, 2.8, -4, 0],
  [0.93, -2.6, 27, 3.5, 3.0, -6, 0],
  [0.965, -2.88, 24, 2.3, 3.2, -6.5, 0],
  [1.0, -2.98, 14.5, 2.1, 2.6, -6.6, 1.2],
];

function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function cameraAt(p: number): number[] {
  let i = 1;
  while (i < CAM.length - 1 && p > CAM[i][0]) i++;
  const k1 = CAM[i - 1], k2 = CAM[i];
  const k0 = CAM[Math.max(0, i - 2)], k3 = CAM[Math.min(CAM.length - 1, i + 1)];
  const t = THREE.MathUtils.clamp((p - k1[0]) / (k2[0] - k1[0]), 0, 1);
  return k1.map((_, j) => (j === 0 ? p : catmull(k0[j], k1[j], k2[j], k3[j], t)));
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function AssemblyVilla({ progressRef, onReady, lowPower, reducedMotion }: { progressRef: MutableRefObject<number>; onReady: () => void; lowPower: boolean; reducedMotion: boolean }) {
  const villa = useVilla("assembly", { shadows: !lowPower, lowPower });
  const { gl, camera, size } = useThree();
  const shown = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);

  const plan = useMemo(() => schedule(villa.elements), [villa]);
  const labelFloorRef = useRef(-1);
  const [labelFloor, setLabelFloor] = useState(-1);
  const labels = useMemo(
    () =>
      villa.rooms
        .filter((r) => r.floor !== "site" && !/Passage|Corridor|Staircase|Balcony|Terrace|Utility|Powder/.test(r.label))
        .map((r) => ({ label: r.label, floor: r.floor as 0 | 1, at: r.box.getCenter(new THREE.Vector3()) })),
    [villa],
  );
  const planes = useMemo(
    () => [
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), -11.4),
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -11.4),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), -9.4),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -9.4),
    ],
    [],
  );

  useEffect(() => {
    gl.localClippingEnabled = true;
    const mats = new Set<THREE.Material>();
    villa.root.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m) mats.add(m);
    });
    for (const m of mats) {
      m.clippingPlanes = planes;
      m.clipIntersection = true;
      m.needsUpdate = true;
    }
    onReady();
  }, [gl, villa, planes, onReady]);

  useFrame((_, dt) => {
    shown.current += (progressRef.current - shown.current) * (reducedMotion ? 1 : Math.min(1, dt * 5));
    const p = shown.current;
    for (const s of plan) {
      const t = THREE.MathUtils.clamp((p - s.start) / (s.end - s.start), 0, 1);
      const e = easeOut(t);
      s.el.obj.visible = (s.always || t > 0) && (s.until === undefined || p < s.until);
      s.el.obj.position.y = s.el.base.y + (s.always ? 0 : s.drop * (1 - e));
    }
    const cut = cutHeight(p);
    planes[0].constant = cut;
    const labelFloor = cut < 4 ? 0 : cut < 7 ? 1 : -1;
    if (labelFloor !== labelFloorRef.current) {
      labelFloorRef.current = labelFloor;
      setLabelFloor(labelFloor);
    }

    const [, az, radius, h, ty, tz, tx] = cameraAt(p);
    const portrait = size.width < size.height;
    const r = radius * (portrait ? 1.55 : 1);
    camera.position.set(Math.sin(az) * r, h * (portrait ? 1.25 : 1), Math.cos(az) * r);
    target.set(tx, ty, tz);
    camera.lookAt(target);
  });

  return (
    <>
      <VillaLights lights={villa.lights} />
      <primitive object={villa.root} />
      <Suspense fallback={null}>
        <VillaProps villa={villa} lowPower={lowPower} clipPlanes={planes} />
      </Suspense>
      {labelFloor >= 0 &&
        labels
          .filter((l) => l.floor === labelFloor)
          .map((l) => (
            <Html key={l.label} position={[l.at.x, labelFloor === 0 ? 3.2 : 6.6, l.at.z]} center zIndexRange={[20, 0]}>
              <span className="pointer-events-none whitespace-nowrap bg-charcoal-dark/75 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-winter-light">
                {l.label}
              </span>
            </Html>
          ))}
    </>
  );
}

export default function AssemblyScene({ progressRef, onReady }: { progressRef: MutableRefObject<number>; onReady: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { open } = useWalkthrough();
  // client-only component (ssr: false), so device checks are safe here
  const [tier] = useState(() => ({ lowPower: isLowPowerDevice(), reducedMotion: prefersReducedMotion() }));

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="w-full h-full">
      <Canvas
        shadows={!tier.lowPower}
        dpr={tier.lowPower ? [1, 1.25] : [1, 1.5]}
        frameloop={visible && !open ? "always" : "never"}
        camera={{ position: [25, 30, 38], fov: 36, near: 0.1, far: 900 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <VillaEnvironment shadowSize={tier.lowPower ? 1024 : 2048} ao={tier.lowPower ? "off" : "full"} />
          <AssemblyVilla progressRef={progressRef} onReady={onReady} lowPower={tier.lowPower} reducedMotion={tier.reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
