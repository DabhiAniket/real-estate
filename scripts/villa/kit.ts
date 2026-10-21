// Modelling toolkit for the villa generator. Everything is built from a few
// shared unit primitives (scaled per node) so the exported GLB stays small and
// every node carries plain world-space semantics that the site runtime reads
// from glTF `extras` (userData).

import * as THREE from "three";
import type { StageId } from "../../src/lib/villa/stages.ts";

export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
export const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
export const UNIT_CYL_LO = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
export const UNIT_CONE = new THREE.CylinderGeometry(0, 0.5, 1, 16);
export const UNIT_SPHERE = new THREE.SphereGeometry(0.5, 20, 14);
export const UNIT_BLOB = new THREE.IcosahedronGeometry(0.5, 1);
export const UNIT_TORUS = new THREE.TorusGeometry(0.5, 0.08, 8, 28);
/** Foliage card: a unit quad with full 0–1 UVs over the leaf atlas. */
export const UNIT_CARD = new THREE.PlaneGeometry(1, 1);

type MatDef = {
  color: string;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  doubleSided?: boolean;
};

// Material library. Names are stable; the runtime only special-cases
// transparent ones (glass/water) and the invisible helper material.
const MATERIALS: Record<string, MatDef> = {
  // structure
  concrete: { color: "#b3afa8", roughness: 0.9, doubleSided: true },
  "concrete-dark": { color: "#6f6b65", roughness: 0.92, doubleSided: true },
  "plaster-exterior": { color: "#f4f3ef", roughness: 0.85, doubleSided: true },
  "plaster-interior": { color: "#f5f3ee", roughness: 0.9, doubleSided: true },
  "stone-cladding": { color: "#b8ab95", roughness: 0.75, doubleSided: true },
  "charcoal-cladding": { color: "#2b2e2b", roughness: 0.6, metalness: 0.15, doubleSided: true },
  copper: { color: "#b98262", roughness: 0.35, metalness: 0.85 },
  // reference villa (webaliser): white render, timber-look cladding, beige
  // large-format porcelain, anthracite aluminium glazing
  "wood-cladding": { color: "#b98a5e", roughness: 0.6, doubleSided: true },
  "porcelain-beige": { color: "#e6d7c0", roughness: 0.55, doubleSided: true },
  "frame-anthracite": { color: "#2c2f31", roughness: 0.4, metalness: 0.5 },
  // reference interiors
  "carpet-cream": { color: "#e9e3d6", roughness: 1 },
  "carpet-beige": { color: "#b4a99a", roughness: 1 },
  "carpet-charcoal": { color: "#4c463f", roughness: 1 },
  "velvet-blue": { color: "#22398a", roughness: 0.7 },
  "velvet-teal": { color: "#0e5a5c", roughness: 0.75 },
  "suede-brown": { color: "#5b3626", roughness: 0.9 },
  "fabric-grey": { color: "#c9c6c0", roughness: 0.95 },
  gold: { color: "#c9a14a", roughness: 0.3, metalness: 1 },
  "lamp-shade-black": { color: "#141414", roughness: 0.6 },
  "lamp-shade-linen": { color: "#f2ead9", roughness: 0.9, emissive: "#ffe0b0", emissiveIntensity: 0.6 },
  "fire-box": { color: "#121212", roughness: 0.9 },
  "metal-black": { color: "#1d1f1d", roughness: 0.45, metalness: 0.6 },
  "metal-steel": { color: "#9ea3a6", roughness: 0.35, metalness: 0.85 },
  chrome: { color: "#d7dadc", roughness: 0.15, metalness: 1 },
  mirror: { color: "#e8eef0", roughness: 0.02, metalness: 1 },
  glass: { color: "#bcd3d8", roughness: 0.05, metalness: 0.1, opacity: 0.28 },
  "glass-frosted": { color: "#e4ecee", roughness: 0.4, opacity: 0.55 },
  // floors
  "floor-marble": { color: "#e6e0d5", roughness: 0.22 },
  "floor-oak": { color: "#a77d55", roughness: 0.55 },
  "floor-tile": { color: "#c8c3ba", roughness: 0.35 },
  "floor-stone": { color: "#cbc3b4", roughness: 0.5 },
  // site
  soil: { color: "#6e5b47", roughness: 1, doubleSided: true },
  grass: { color: "#5f7d3c", roughness: 0.95 },
  "grass-dark": { color: "#4b6531", roughness: 1 },
  asphalt: { color: "#3c3d3b", roughness: 0.95 },
  paver: { color: "#a39b8f", roughness: 0.85 },
  "paver-dark": { color: "#6d675f", roughness: 0.85 },
  gravel: { color: "#b9b2a6", roughness: 1 },
  "boundary-plaster": { color: "#d9d2c6", roughness: 0.9 },
  "pool-tile": { color: "#4d9fb1", roughness: 0.3 },
  travertine: { color: "#e2d6c2", roughness: 0.7, doubleSided: true },
  water: { color: "#3f9fb5", roughness: 0.05, metalness: 0.1, opacity: 0.72 },
  bark: { color: "#5a4632", roughness: 1 },
  leaf: { color: "#456a2f", roughness: 0.9 },
  "leaf-dark": { color: "#2f4f26", roughness: 0.95 },
  "leaf-light": { color: "#6d8f3e", roughness: 0.9 },
  "leaf-olive": { color: "#8f9c7c", roughness: 0.9 },
  // alpha-tested leaf cards (runtime binds the CC0 leaf atlas); colour tints it
  "leaf-card": { color: "#ffffff", roughness: 0.75, doubleSided: true },
  "leaf-card-dark": { color: "#c3cdb4", roughness: 0.8, doubleSided: true },
  "leaf-card-olive": { color: "#d5dcc6", roughness: 0.8, doubleSided: true },
  agave: { color: "#7d9c8f", roughness: 0.6 },
  "grass-blade": { color: "#c2ad73", roughness: 0.9 },
  flower: { color: "#c9677d", roughness: 0.8 },
  "flower-white": { color: "#f1ece4", roughness: 0.8 },
  terracotta: { color: "#a9623f", roughness: 0.85 },
  // joinery & furniture
  "wood-walnut": { color: "#5e3f2a", roughness: 0.55 },
  "wood-oak": { color: "#b8916a", roughness: 0.55 },
  "cabinet-charcoal": { color: "#33383a", roughness: 0.5 },
  "cabinet-sage": { color: "#7d8a78", roughness: 0.55 },
  "cabinet-linen": { color: "#e6ded1", roughness: 0.55 },
  quartz: { color: "#efebe5", roughness: 0.2 },
  "granite-black": { color: "#1f2021", roughness: 0.25, metalness: 0.1 },
  "fabric-linen": { color: "#d8cdbd", roughness: 0.95 },
  "fabric-charcoal": { color: "#3f4240", roughness: 0.95 },
  "fabric-sage": { color: "#8d9a85", roughness: 0.95 },
  "fabric-terracotta": { color: "#b46a4c", roughness: 0.95 },
  "fabric-navy": { color: "#2f3b4f", roughness: 0.95 },
  leather: { color: "#7a4a2e", roughness: 0.6 },
  bedding: { color: "#f3efe8", roughness: 0.95 },
  rug: { color: "#8f7e6d", roughness: 1 },
  "rug-light": { color: "#cfc4b3", roughness: 1 },
  curtain: { color: "#e9e1d4", roughness: 1, opacity: 0.9 },
  ceramic: { color: "#f5f4f1", roughness: 0.15 },
  "screen-black": { color: "#0d0e0f", roughness: 0.2, metalness: 0.4 },
  "appliance-steel": { color: "#b9bcbd", roughness: 0.3, metalness: 0.8 },
  "art-ochre": { color: "#c3934a", roughness: 0.8 },
  "art-blue": { color: "#47647e", roughness: 0.8 },
  "art-rust": { color: "#9b4f33", roughness: 0.8 },
  book: { color: "#7b5b44", roughness: 0.8 },
  "book-alt": { color: "#3f5a5a", roughness: 0.8 },
  "car-paint": { color: "#2f3a40", roughness: 0.25, metalness: 0.7 },
  tyre: { color: "#151515", roughness: 0.9 },
  // light emitters
  "light-warm": { color: "#fff1dc", emissive: "#ffd9a8", emissiveIntensity: 2.2 },
  "light-cool": { color: "#f4f7ff", emissive: "#eaf1ff", emissiveIntensity: 1.6 },
  "light-pool": { color: "#bff3ff", emissive: "#7fe3ff", emissiveIntensity: 2.5 },
  "fire-glow": { color: "#ff9a4d", emissive: "#ff7a2e", emissiveIntensity: 2.5 },
  // blueprint set-out lines (winter blue)
  "blueprint-line": { color: "#c9dce8", emissive: "#c9dce8", emissiveIntensity: 1.4 },
  // invisible navigation/collision helpers (hidden by the runtime)
  helper: { color: "#ff00ff", opacity: 0.25 },
};

const materialCache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(name: keyof typeof MATERIALS | string): THREE.MeshStandardMaterial {
  const cached = materialCache.get(name);
  if (cached) return cached;
  const def = MATERIALS[name];
  if (!def) throw new Error(`Unknown material ${name}`);
  const m = new THREE.MeshStandardMaterial({
    name,
    color: def.color,
    roughness: def.roughness ?? 0.8,
    metalness: def.metalness ?? 0,
  });
  if (def.opacity !== undefined) {
    m.transparent = true;
    m.opacity = def.opacity;
  }
  if (def.emissive) {
    m.emissive = new THREE.Color(def.emissive);
    m.emissiveIntensity = def.emissiveIntensity ?? 1;
  }
  if (def.doubleSided) m.side = THREE.DoubleSide;
  materialCache.set(name, m);
  return m;
}

export type Floor = 0 | 1 | "site";
export type Box = [number, number, number, number, number, number]; // x0 x1 y0 y1 z0 z1

export interface ItemOpts {
  /** Adds an AABB collider around the finished item (default true). */
  collide?: boolean;
  /** Shrinks (negative) or grows the collider footprint in metres. */
  pad?: number;
  floor?: Floor;
  seq?: number;
}

/**
 * Scene builder. Geometry is always added to `this.parent`, in that parent's
 * local frame. Element groups are created per stage; helper groups hold the
 * invisible collision, walkable, room and navigation data.
 */
export class Builder {
  root = new THREE.Group();
  stages = new Map<StageId, THREE.Group>();
  colliders = new THREE.Group();
  walkable = new THREE.Group();
  rooms = new THREE.Group();
  nav = new THREE.Group();
  parent: THREE.Object3D = this.root;
  private counters = new Map<string, number>();

  constructor(stageIds: StageId[]) {
    this.root.name = "villa";
    this.root.userData = { kind: "villa-root", version: 1 };
    for (const id of stageIds) {
      const g = new THREE.Group();
      g.name = id;
      g.userData = { stage: id };
      this.stages.set(id, g);
      this.root.add(g);
    }
    const helpers: [THREE.Group, string][] = [
      [this.colliders, "colliders"],
      [this.walkable, "walkable"],
      [this.rooms, "rooms"],
      [this.nav, "nav"],
    ];
    for (const [g, name] of helpers) {
      g.name = name;
      g.userData = { helperGroup: name };
      this.root.add(g);
    }
  }

  private uniqueName(base: string) {
    const n = (this.counters.get(base) ?? 0) + 1;
    this.counters.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  }

  /** Runs `fn` with `obj` as the current parent. */
  within<T>(obj: THREE.Object3D, fn: () => T): T {
    const prev = this.parent;
    this.parent = obj;
    try {
      return fn();
    } finally {
      this.parent = prev;
    }
  }

  /** Authors `fn` inside a child group placed at `pos` (local frame of the current parent). */
  group(pos: THREE.Vector3Tuple, fn: () => void, rotY = 0) {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.y = rotY;
    this.parent.add(g);
    this.within(g, fn);
    return g;
  }

  /**
   * An independently animatable architectural element. `at`/`rotY` place the
   * element's local frame; geometry inside `fn` is authored in that frame.
   */
  element(
    stage: StageId,
    name: string,
    fn: () => void,
    opts: ItemOpts & { at?: [number, number, number]; rotY?: number } = {},
  ): THREE.Group {
    const g = new THREE.Group();
    g.name = this.uniqueName(name);
    g.userData = { element: true, stage, floor: opts.floor ?? "site", ...(opts.seq !== undefined ? { seq: opts.seq } : {}) };
    if (opts.at) g.position.set(...opts.at);
    if (opts.rotY) g.rotation.y = opts.rotY;
    this.stages.get(stage)!.add(g);
    this.within(g, fn);
    if (opts.collide) {
      g.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(g);
      const p = opts.pad ?? -0.02;
      this.collider([bb.min.x - p, bb.max.x + p, bb.min.y, bb.max.y, bb.min.z - p, bb.max.z + p], g.name);
    }
    return g;
  }

  /**
   * A real (CC0, photoscanned) model placed at runtime from
   * public/models/props/<asset>.glb. The GLB only stores the anchor: asset id,
   * planned footprint [width x, height, depth z] in the element's frame and a
   * yaw offset for the model's own orientation. The collider is the footprint.
   */
  prop(
    stage: StageId,
    name: string,
    at: [number, number, number],
    rotY: number,
    asset: string,
    foot: [number, number, number],
    opts: ItemOpts & { yaw?: number } = {},
  ) {
    return this.element(stage, name, () => {
      const anchor = new THREE.Object3D();
      anchor.name = `prop-${asset}`;
      anchor.userData = { kind: "prop", asset, foot, yaw: opts.yaw ?? 0 };
      this.parent.add(anchor);
      if (opts.collide ?? true) {
        // world-space footprint (rotations here are multiples of 90°)
        const quarter = Math.round(rotY / (Math.PI / 2)) % 2 !== 0;
        const [w, h, d] = foot;
        const hx = (quarter ? d : w) / 2, hz = (quarter ? w : d) / 2;
        this.collider([at[0] - hx, at[0] + hx, at[1], at[1] + h, at[2] - hz, at[2] + hz], name);
      }
    }, { ...opts, at, rotY, collide: false });
  }

  /** Furniture-style element: collides by default. */
  item(stage: StageId, name: string, at: [number, number, number], rotY: number, fn: () => void, opts: ItemOpts = {}) {
    return this.element(stage, name, fn, { ...opts, at, rotY, collide: opts.collide ?? true });
  }

  private add(geom: THREE.BufferGeometry, material: string, pos: THREE.Vector3Tuple, scale: THREE.Vector3Tuple, rot?: THREE.Vector3Tuple) {
    const m = new THREE.Mesh(geom, mat(material));
    m.position.set(...pos);
    m.scale.set(...scale);
    if (rot) m.rotation.set(...rot);
    this.parent.add(m);
    return m;
  }

  /** Axis-aligned box from min/max extents. */
  box(material: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    const sx = Math.abs(x1 - x0), sy = Math.abs(y1 - y0), sz = Math.abs(z1 - z0);
    if (sx < 1e-4 || sy < 1e-4 || sz < 1e-4) return null;
    return this.add(UNIT_BOX, material, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [sx, sy, sz]);
  }

  /** Centred box with optional rotation. */
  boxC(material: string, c: THREE.Vector3Tuple, s: THREE.Vector3Tuple, rot?: THREE.Vector3Tuple) {
    return this.add(UNIT_BOX, material, c, s, rot);
  }

  cyl(material: string, x: number, y0: number, y1: number, z: number, r: number, lo = false) {
    return this.add(lo ? UNIT_CYL_LO : UNIT_CYL, material, [x, (y0 + y1) / 2, z], [r * 2, y1 - y0, r * 2]);
  }

  /** Cylinder lying along an axis (wheels, rails, rolls). */
  cylAxis(material: string, c: THREE.Vector3Tuple, r: number, len: number, axis: "x" | "z") {
    const rot: THREE.Vector3Tuple = axis === "x" ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0];
    return this.add(UNIT_CYL, material, c, [r * 2, len, r * 2], rot);
  }

  cone(material: string, x: number, y0: number, y1: number, z: number, r: number) {
    return this.add(UNIT_CONE, material, [x, (y0 + y1) / 2, z], [r * 2, y1 - y0, r * 2]);
  }

  sphere(material: string, c: THREE.Vector3Tuple, s: THREE.Vector3Tuple) {
    return this.add(UNIT_SPHERE, material, c, s);
  }

  blob(material: string, c: THREE.Vector3Tuple, s: THREE.Vector3Tuple, rotY = 0) {
    return this.add(UNIT_BLOB, material, c, s, [0, rotY, 0]);
  }

  card(material: string, c: THREE.Vector3Tuple, w: number, h: number, rot: THREE.Vector3Tuple) {
    return this.add(UNIT_CARD, material, c, [w, h, 1], rot);
  }

  torus(material: string, c: THREE.Vector3Tuple, r: number, rot: THREE.Vector3Tuple = [Math.PI / 2, 0, 0]) {
    return this.add(UNIT_TORUS, material, c, [r * 2, r * 2, r * 2], rot);
  }

  // ---- helpers (world space) -------------------------------------------

  private helperBox(group: THREE.Group, b: Box, userData: Record<string, unknown>, name: string) {
    const m = new THREE.Mesh(UNIT_BOX, mat("helper"));
    m.position.set((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2);
    m.scale.set(Math.max(1e-3, b[1] - b[0]), Math.max(1e-3, b[3] - b[2]), Math.max(1e-3, b[5] - b[4]));
    m.name = this.uniqueName(name);
    m.userData = userData;
    group.add(m);
    return m;
  }

  /** Solid volume the visitor cannot enter. */
  collider(b: Box, name = "collider") {
    return this.helperBox(this.colliders, b, { kind: "collider" }, `col-${name}`);
  }

  /** Horizontal walkable surface with its top at `top`. */
  walk(x0: number, x1: number, top: number, z0: number, z1: number, name = "floor") {
    return this.helperBox(this.walkable, [x0, x1, top - 0.05, top, z0, z1], { kind: "walkable" }, `walk-${name}`);
  }

  /** Inclined walkable surface (stair flights, steps) running along z. */
  rampZ(x0: number, x1: number, zA: number, yA: number, zB: number, yB: number, name = "ramp") {
    const len = Math.hypot(zB - zA, yB - yA);
    const m = new THREE.Mesh(UNIT_BOX, mat("helper"));
    m.position.set((x0 + x1) / 2, (yA + yB) / 2 - 0.025, (zA + zB) / 2);
    m.scale.set(x1 - x0, 0.05, len);
    // tilt so the box's local z axis runs along A→B
    m.rotation.x = -Math.atan2(yB - yA, Math.abs(zB - zA)) * (zB > zA ? 1 : -1);
    m.name = this.uniqueName(`walk-${name}`);
    m.userData = { kind: "walkable" };
    this.walkable.add(m);
    return m;
  }

  room(label: string, floor: Floor, x0: number, x1: number, z0: number, z1: number, y0: number, y1: number) {
    return this.helperBox(this.rooms, [x0, x1, y0, y1, z0, z1], { kind: "room", label, floor }, `room-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
  }

  /** Anchor for a runtime point light (relative intensity 0–1). */
  lightPoint(x: number, y: number, z: number, intensity = 1) {
    const o = new THREE.Object3D();
    o.name = this.uniqueName("light");
    o.position.set(x, y, z);
    o.userData = { kind: "light", intensity };
    this.nav.add(o);
    return o;
  }

  navPoint(id: string, x: number, y: number, z: number) {
    const o = new THREE.Object3D();
    o.name = `nav-${id}`;
    o.position.set(x, y, z);
    o.userData = { kind: "nav", id };
    this.nav.add(o);
    return o;
  }
}

/** Splits `outer` minus `holes` into a list of non-overlapping rectangles. */
export function subtractRects(
  outer: [number, number, number, number],
  holes: [number, number, number, number][],
): [number, number, number, number][] {
  const [ox0, ox1, oz0, oz1] = outer;
  const xs = new Set([ox0, ox1]);
  const zs = new Set([oz0, oz1]);
  for (const [x0, x1, z0, z1] of holes) {
    for (const x of [x0, x1]) if (x > ox0 && x < ox1) xs.add(x);
    for (const z of [z0, z1]) if (z > oz0 && z < oz1) zs.add(z);
  }
  const X = [...xs].sort((a, b) => a - b);
  const Z = [...zs].sort((a, b) => a - b);
  const inHole = (cx: number, cz: number) => holes.some(([x0, x1, z0, z1]) => cx > x0 && cx < x1 && cz > z0 && cz < z1);
  const out: [number, number, number, number][] = [];
  for (let j = 0; j < Z.length - 1; j++) {
    let start: number | null = null;
    for (let i = 0; i < X.length - 1; i++) {
      const filled = !inHole((X[i] + X[i + 1]) / 2, (Z[j] + Z[j + 1]) / 2);
      if (filled && start === null) start = X[i];
      if (!filled && start !== null) {
        out.push([start, X[i], Z[j], Z[j + 1]]);
        start = null;
      }
    }
    if (start !== null) out.push([start, X[X.length - 1], Z[j], Z[j + 1]]);
  }
  return out;
}
