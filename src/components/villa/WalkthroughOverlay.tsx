"use client";
/* eslint-disable react-hooks/immutability -- R3F scene code mutates three.js objects, door state and input refs imperatively inside useFrame and event handlers. */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Eye, Footprints, Map as MapIcon, MousePointer2, X } from "lucide-react";
import VillaEnvironment from "./VillaEnvironment";
import { useVilla } from "./useVilla";
import VillaLights from "./VillaLights";
import VillaProps from "./VillaProps";
import { EYE_HEIGHT, Walker, stepDoor, type MoveInput } from "@/lib/villa/walker";
import { roomAt, type RoomInfo, type VillaIndex } from "@/lib/villa/model";
import { isLowPowerDevice } from "@/lib/device";
import { closeWalkthrough, type TourPose, type TourStart } from "@/lib/villa/walkthroughStore";

interface Controls {
  keys: Set<string>;
  stick: { x: number; y: number };
  look: { dx: number; dy: number };
}

interface Hud {
  room: string;
  floor: 0 | 1 | "site";
  x: number;
  z: number;
  yaw: number;
}

const DEFAULT_FROM = { position: [20, 7, 30] as const, target: [0, 3, 0] as const };
const FLY_TIME = 2.6;
const FLY_TIME_AROUND = 5.2;
const WALK_TIME = 4.6;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Point at arc-length fraction `u` along a polyline. */
function along(points: THREE.Vector3[], u: number, out: THREE.Vector3) {
  const lens = points.slice(1).map((p, i) => p.distanceTo(points[i]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = u * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) return out.lerpVectors(points[i], points[i + 1], Math.min(1, d / lens[i]));
    d -= lens[i];
  }
  return out.copy(points[points.length - 1]);
}

function WalkScene({
  lowPower,
  start,
  controls,
  walkerRef,
  skipRef,
  onEntered,
  onHud,
  onIndex,
}: {
  lowPower: boolean;
  start: TourStart;
  controls: MutableRefObject<Controls>;
  walkerRef: MutableRefObject<Walker | null>;
  skipRef: MutableRefObject<boolean>;
  onEntered: () => void;
  onHud: (h: Hud) => void;
  onIndex: (v: VillaIndex) => void;
}) {
  const villa = useVilla("static", { lowPower });
  const { camera } = useThree();
  const walker = useMemo(() => new Walker(villa), [villa]);
  const phase = useRef<"entering" | "walking">(start.kind === "resume" ? "walking" : "entering");
  const clock = useRef(0);
  const hudTimer = useRef(0);
  const fill = useRef<THREE.PointLight>(null);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const frontDoor = useMemo(() => villa.doors.find((d) => d.entry) ?? null, [villa]);

  const path = useMemo(() => {
    const n = villa.nav;
    const from = start.kind === "entrance" && start.from ? start.from : DEFAULT_FROM;
    const eye = (v: THREE.Vector3) => v.clone();
    const approach = eye(n.approach), porch = eye(n.porch), threshold = eye(n.threshold), foyer = eye(n.foyer);
    const door = n["front-door"].clone().setY(porch.y);
    const p0 = new THREE.Vector3(...from.position);
    // From behind the house (the pool-side hero view) fly around the west
    // garden to the street side instead of through the building.
    const around = p0.z < 6;
    const fly = new THREE.CatmullRomCurve3(
      around
        ? [p0, new THREE.Vector3(-13.2, 4.2, -7), new THREE.Vector3(-13.2, 3.4, 4), new THREE.Vector3(-8.5, 2.4, 12.5), approach]
        : [p0, approach],
      false,
      "centripetal",
    );
    return {
      fly,
      flyTime: around ? FLY_TIME_AROUND : FLY_TIME,
      p0,
      l0: new THREE.Vector3(...from.target),
      approach,
      walk: [approach, porch, threshold, foyer],
      look: [door.clone().setY(approach.y), door, new THREE.Vector3(0, threshold.y, 0), new THREE.Vector3(0, foyer.y, -3)],
      doorAt: (approach.distanceTo(porch) - 1.6) / (approach.distanceTo(porch) + porch.distanceTo(threshold) + threshold.distanceTo(foyer)),
    };
  }, [villa, start]);

  useEffect(() => {
    walkerRef.current = walker;
    onIndex(villa);
    if (start.kind === "resume") {
      walker.feet.set(...start.pose.feet);
      walker.eyeY = walker.feet.y + EYE_HEIGHT;
      walker.yaw = start.pose.yaw;
      walker.pitch = start.pose.pitch;
      onEntered();
    } else {
      camera.position.copy(path.p0);
      camera.lookAt(path.l0);
    }
    return () => {
      walkerRef.current = null;
    };
  }, [walker, villa, start, path, camera, walkerRef, onEntered, onIndex]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    if (phase.current === "entering") {
      clock.current += dt;
      if (skipRef.current) clock.current = path.flyTime + WALK_TIME;
      const t = clock.current;
      if (t < path.flyTime) {
        const u = easeInOut(t / path.flyTime);
        path.fly.getPoint(u, camera.position);
        // keep the house in view while circling, then settle on the door
        const k = THREE.MathUtils.smoothstep(u, 0.55, 1);
        tmpA.lerpVectors(path.l0, path.look[0], k);
        camera.lookAt(tmpA);
      } else {
        const u = easeInOut(Math.min(1, (t - path.flyTime) / WALK_TIME));
        along(path.walk, u, tmpA);
        along(path.look, u, tmpB);
        camera.position.copy(tmpA);
        camera.lookAt(tmpB);
        if (frontDoor && u >= path.doorAt) frontDoor.target = 1;
        if (u >= 1) {
          phase.current = "walking";
          walker.placeAtEye(path.walk[path.walk.length - 1], 0, 0);
          skipRef.current = false;
          onEntered();
        }
      }
      if (frontDoor) {
        if (skipRef.current) {
          frontDoor.target = 1;
          frontDoor.openness = 1;
        }
        stepDoor(frontDoor, dt);
      }
    } else {
      const c = controls.current;
      const k = c.keys;
      const input: MoveInput = {
        forward: (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) - (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) + c.stick.y,
        strafe: (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) - (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0) + c.stick.x,
        run: k.has("ShiftLeft") || k.has("ShiftRight") || Math.hypot(c.stick.x, c.stick.y) > 0.95,
      };
      walker.look(c.look.dx, c.look.dy);
      c.look.dx = 0;
      c.look.dy = 0;
      walker.update(dt, input);
      walker.applyToCamera(camera);
    }
    fill.current?.position.copy(camera.position);

    hudTimer.current += dt;
    if (hudTimer.current > 0.15) {
      hudTimer.current = 0;
      const probe = phase.current === "walking" ? tmpA.set(walker.feet.x, walker.feet.y + 0.5, walker.feet.z) : tmpA.copy(camera.position).setY(camera.position.y - 1.1);
      const room: RoomInfo | null = roomAt(villa.rooms, probe);
      const yaw = phase.current === "walking" ? walker.yaw : new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ").y;
      onHud({ room: room?.label ?? "Approach", floor: room?.floor ?? "site", x: probe.x, z: probe.z, yaw });
    }
  });

  return (
    <>
      <primitive object={villa.root} />
      <VillaLights lights={villa.lights} />
      <Suspense fallback={null}>
        <VillaProps villa={villa} lowPower={lowPower} />
      </Suspense>
      <pointLight ref={fill} intensity={6} distance={11} decay={1.4} color="#fff0db" />
    </>
  );
}

// ------------------------------------------------------------------ HUD bits

function Minimap({ villa, hud }: { villa: VillaIndex; hud: Hud }) {
  const floor = hud.floor === "site" ? 0 : hud.floor;
  const outside = hud.floor === "site";
  const rooms = villa.rooms.filter((r) => r.floor === floor);
  const vb = outside ? [-16.5, -18.5, 33, 35] : [-11.6, -9.0, 23.2, 18.2];
  return (
    <svg viewBox={vb.join(" ")} className="w-full h-full" aria-label="Floor plan with your position">
      {outside && <rect x={-16} y={-18} width={32} height={34} fill="none" stroke="#A6A096" strokeOpacity={0.4} strokeWidth={0.15} />}
      {rooms.map((r) => {
        const here = r.label === hud.room;
        return (
          <rect
            key={r.label}
            x={r.box.min.x}
            y={r.box.min.z}
            width={r.box.max.x - r.box.min.x}
            height={r.box.max.z - r.box.min.z}
            fill={here ? "#B98262" : "#F1EAE0"}
            fillOpacity={here ? 0.55 : 0.08}
            stroke="#F1EAE0"
            strokeOpacity={0.55}
            strokeWidth={0.08}
          />
        );
      })}
      <g transform={`translate(${hud.x} ${hud.z}) rotate(${(-hud.yaw * 180) / Math.PI})`}>
        <circle r={outside ? 0.9 : 0.55} fill="#B98262" fillOpacity={0.25} />
        <path d={outside ? "M0 -1.1 L0.7 0.8 L0 0.4 L-0.7 0.8 Z" : "M0 -0.7 L0.45 0.5 L0 0.25 L-0.45 0.5 Z"} fill="#B98262" />
      </g>
    </svg>
  );
}

function Joystick({ controls }: { controls: MutableRefObject<Controls> }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const update = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    const R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const len = Math.hypot(dx, dy);
    if (len > R) { dx = (dx / len) * R; dy = (dy / len) * R; }
    setKnob({ x: dx, y: dy });
    controls.current.stick = { x: dx / R, y: -dy / R };
  };
  const end = () => {
    id.current = null;
    setKnob({ x: 0, y: 0 });
    controls.current.stick = { x: 0, y: 0 };
  };
  return (
    <div
      ref={base}
      className="pointer-events-auto relative h-32 w-32 rounded-full border border-stone-subtle bg-charcoal-dark/60 backdrop-blur-md touch-none"
      onPointerDown={(e) => { id.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e); }}
      onPointerMove={(e) => { if (id.current === e.pointerId) update(e); }}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Move joystick"
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -ml-6 -mt-6 rounded-full bg-copper/80 border border-copper"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}

const FLOOR_LABEL = { 0: "Ground floor", 1: "First floor", site: "Grounds" } as const;

export default function WalkthroughOverlay({ start }: { start: TourStart }) {
  const controls = useRef<Controls>({ keys: new Set(), stick: { x: 0, y: 0 }, look: { dx: 0, dy: 0 } });
  const walkerRef = useRef<Walker | null>(null);
  const skipRef = useRef(false);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(start.kind === "resume");
  const [hud, setHud] = useState<Hud>({ room: "Approach", floor: "site", x: 0, z: 14, yaw: 0 });
  const [villa, setVilla] = useState<VillaIndex | null>(null);
  const [locked, setLocked] = useState(false);
  // the overlay is client-only (ssr: false), so matchMedia is safe here
  const [touch] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [lowPower] = useState(() => isLowPowerDevice());
  const [showMap, setShowMap] = useState(true);
  const unlockedAt = useRef(0);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const exit = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    const w = walkerRef.current;
    const pose: TourPose | null = w && entered ? { feet: w.feet.toArray() as TourPose["feet"], yaw: w.yaw, pitch: w.pitch } : null;
    closeWalkthrough(pose);
  }, [entered]);

  useEffect(() => {
    const keys = controls.current.keys;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        // the first Esc releases pointer lock (handled by the browser)
        if (!document.pointerLockElement && performance.now() - unlockedAt.current > 250) exit();
        return;
      }
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(e.code)) {
        keys.add(e.code);
        e.preventDefault();
      }
      if (e.code === "KeyM") setShowMap((v) => !v);
    };
    const up = (e: KeyboardEvent) => keys.delete(e.code);
    const blur = () => keys.clear();
    const lockChange = () => {
      const isLocked = document.pointerLockElement === canvasWrap.current?.querySelector("canvas");
      if (!isLocked) unlockedAt.current = performance.now();
      setLocked(isLocked);
    };
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        controls.current.look.dx += e.movementX * 0.0022;
        controls.current.look.dy += e.movementY * 0.0022;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    document.addEventListener("pointerlockchange", lockChange);
    document.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      document.removeEventListener("pointerlockchange", lockChange);
      document.removeEventListener("mousemove", move);
      keys.clear();
    };
  }, [exit]);

  const requestLock = () => {
    const canvas = canvasWrap.current?.querySelector("canvas");
    if (!entered || touch || !canvas || document.pointerLockElement) return;
    try {
      const r = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      r?.catch?.(() => undefined);
    } catch {
      /* pointer lock unavailable — drag-to-look still works */
    }
  };

  const onEntered = useCallback(() => setEntered(true), []);

  return (
    <div className="fixed inset-0 z-[60] bg-charcoal-dark text-linen" role="dialog" aria-label="3D walkthrough of the residence">
      <div
        ref={canvasWrap}
        className="absolute inset-0 touch-none"
        onClick={requestLock}
        onPointerDown={(e) => {
          if (document.pointerLockElement) return;
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId || !entered) return;
          const k = e.pointerType === "touch" ? 0.005 : 0.004;
          controls.current.look.dx += (e.clientX - d.x) * k;
          controls.current.look.dy += (e.clientY - d.y) * k;
          d.x = e.clientX;
          d.y = e.clientY;
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <Canvas
          shadows
          dpr={[1, touch ? 1.5 : 1.75]}
          camera={{ position: [20, 7, 30], fov: touch ? 74 : 68, near: 0.05, far: 900 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <VillaEnvironment shadowSize={lowPower ? 1024 : 2048} envIntensity={0.9} ao={lowPower ? "off" : "half"} />
            <WalkScene
              lowPower={lowPower}
              start={start}
              controls={controls}
              walkerRef={walkerRef}
              skipRef={skipRef}
              onEntered={onEntered}
              onHud={setHud}
              onIndex={setVilla}
            />
          </Suspense>
        </Canvas>
        {!villa && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal-dark">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-arch">Opening the residence…</span>
          </div>
        )}
        {entered && locked && <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-linen/80" />}
      </div>

      {/* Top bar: location + exit */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="bg-charcoal-dark/80 border border-stone-subtle px-3 py-2 backdrop-blur-md">
          <span className="block font-mono text-xs uppercase tracking-widest text-copper">{FLOOR_LABEL[hud.floor]}</span>
          <span className="font-serif text-lg sm:text-xl text-linen">{hud.room}</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {!entered && villa && (
            <button
              type="button"
              onClick={() => (skipRef.current = true)}
              className="border border-stone-subtle bg-charcoal-dark/80 px-3 py-2 font-mono text-xs text-stone-arch hover:text-linen"
            >
              Skip entrance
            </button>
          )}
          <button
            type="button"
            onClick={exit}
            className="flex items-center gap-2 border border-stone-subtle bg-charcoal-dark/85 px-3 py-2 font-mono text-xs text-linen hover:border-copper"
          >
            Exit Tour <X className="h-4 w-4 text-copper" />
          </button>
        </div>
      </div>

      {/* Minimap */}
      {villa && showMap && (
        <div className="pointer-events-none absolute right-3 top-16 sm:right-5 sm:top-20 z-10 w-40 sm:w-56 aspect-[23/18] bg-charcoal-dark/75 border border-stone-subtle p-1.5 backdrop-blur-md">
          <Minimap villa={villa} hud={hud} />
        </div>
      )}

      {/* Controls guide / touch controls */}
      {entered && !touch && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-charcoal-dark/85 border border-stone-subtle px-3 py-2 font-mono text-xs text-stone-arch backdrop-blur-md">
          <span className="flex items-center gap-1.5 text-linen"><Footprints className="h-3.5 w-3.5 text-copper" /> WASD / arrows · Shift to run</span>
          <span className="flex items-center gap-1.5">
            {locked ? <><Eye className="h-3.5 w-3.5 text-copper" /> Mouse to look · Esc releases cursor</> : <><MousePointer2 className="h-3.5 w-3.5 text-copper" /> Click to look around (or drag) · Esc exits</>}
          </span>
          <span className="flex items-center gap-1.5"><MapIcon className="h-3.5 w-3.5 text-copper" /> M map</span>
        </div>
      )}
      {entered && touch && (
        <>
          <div className="pointer-events-none absolute bottom-5 left-5 z-10"><Joystick controls={controls} /></div>
          <div className="pointer-events-none absolute bottom-6 right-5 z-10 bg-charcoal-dark/80 border border-stone-subtle px-3 py-2 font-mono text-xs text-stone-arch">
            Drag to look · stick to walk
          </div>
        </>
      )}
    </div>
  );
}
