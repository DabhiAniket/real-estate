// Runtime index of the villa GLB. Everything here is derived from glTF extras
// (userData) written by scripts/build-villa-glb.ts — see docs/villa-model.md
// for the contract a production model must follow to be a drop-in
// replacement.

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { StageId } from "./stages";

export const VILLA_URL = "/models/villa.glb";

export type FloorTag = 0 | 1 | "site";

export interface ElementInfo {
  obj: THREE.Object3D;
  stage: StageId;
  floor: FloorTag;
  seq: number;
  minY: number;
  center: THREE.Vector3;
  base: THREE.Vector3;
}

export interface DoorInfo {
  obj: THREE.Object3D;
  id: string;
  type: "swing" | "slide";
  openAngle: number;
  slide: THREE.Vector3;
  base: THREE.Vector3;
  baseRotY: number;
  collider: THREE.Box3;
  center: THREE.Vector3;
  entry: boolean;
  openness: number;
  target: number;
}

export interface RoomInfo {
  label: string;
  floor: FloorTag;
  box: THREE.Box3;
}

export interface PropAnchor {
  obj: THREE.Object3D;
  asset: string;
  /** Planned footprint [width x, height, depth z] in the anchor's frame. */
  foot: [number, number, number];
  yaw: number;
}

export interface LightAnchor {
  position: THREE.Vector3;
  intensity: number;
}

export interface VillaIndex {
  root: THREE.Object3D;
  elements: ElementInfo[];
  colliders: THREE.Box3[];
  walkable: THREE.Mesh[];
  rooms: RoomInfo[];
  doors: DoorInfo[];
  nav: Record<string, THREE.Vector3>;
  lights: LightAnchor[];
  props: PropAnchor[];
}

const isHelperGroup = (o: THREE.Object3D) => typeof o.userData.helperGroup === "string";

function isInsideDoor(o: THREE.Object3D, stopAt: THREE.Object3D) {
  for (let p: THREE.Object3D | null = o; p && p !== stopAt; p = p.parent) {
    if (p.userData.kind === "door") return true;
  }
  return false;
}

function toFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
  const out = new Float32Array(attr.count * attr.itemSize);
  for (let i = 0; i < attr.count; i++) {
    for (let c = 0; c < attr.itemSize; c++) out[i * attr.itemSize + c] = attr.getComponent(i, c);
  }
  return new THREE.BufferAttribute(out, attr.itemSize);
}

/**
 * Undoes KHR_mesh_quantization (meshopt): rebuilds each visible mesh's
 * geometry as float attributes with the mesh's local transform baked in, so
 * positions are real metres in the element's frame again. Triplanar
 * texturing and merging both depend on that. Helper volumes are left as-is.
 */
export function dequantize(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (let p: THREE.Object3D | null = mesh; p && p !== root; p = p.parent) if (isHelperGroup(p)) return;
    if (mesh.geometry.attributes.position.array instanceof Float32Array) return;
    meshes.push(mesh);
  });
  for (const mesh of meshes) {
    const src = mesh.geometry;
    const g = new THREE.BufferGeometry();
    for (const name of ["position", "normal", "uv"]) {
      const a = src.getAttribute(name);
      if (a) g.setAttribute(name, toFloat(a));
    }
    if (src.index) g.setIndex(src.index.clone());
    mesh.updateMatrix();
    g.applyMatrix4(mesh.matrix);
    mesh.position.set(0, 0, 0);
    mesh.quaternion.identity();
    mesh.scale.set(1, 1, 1);
    mesh.geometry = g;
  }
}

/** Applies shadow flags, hides helpers and tunes transparent materials. */
export function prepareScene(root: THREE.Object3D, { shadows = true } = {}) {
  root.traverse((o) => {
    if (isHelperGroup(o)) o.visible = false;
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const m = mesh.material as THREE.MeshStandardMaterial;
    const transparent = m.transparent;
    mesh.castShadow = shadows && !transparent && !m.name.startsWith("light");
    mesh.receiveShadow = shadows && !transparent;
    if (transparent) m.depthWrite = false;
  });
}

export function analyzeVilla(root: THREE.Object3D): VillaIndex {
  root.updateMatrixWorld(true);
  const elements: ElementInfo[] = [];
  const colliders: THREE.Box3[] = [];
  const walkable: THREE.Mesh[] = [];
  const rooms: RoomInfo[] = [];
  const doors: DoorInfo[] = [];
  const nav: Record<string, THREE.Vector3> = {};
  const lights: LightAnchor[] = [];
  const props: PropAnchor[] = [];
  const tmp = new THREE.Box3();

  root.traverse((o) => {
    const u = o.userData;
    if (u.element) {
      tmp.setFromObject(o);
      elements.push({
        obj: o,
        stage: u.stage,
        floor: u.floor ?? "site",
        seq: u.seq ?? 0,
        minY: tmp.isEmpty() ? 0 : tmp.min.y,
        center: tmp.isEmpty() ? o.position.clone() : tmp.getCenter(new THREE.Vector3()),
        base: o.position.clone(),
      });
    }
    switch (u.kind) {
      case "collider":
        colliders.push(new THREE.Box3().setFromObject(o));
        break;
      case "walkable":
        walkable.push(o as THREE.Mesh);
        break;
      case "room":
        rooms.push({ label: u.label, floor: u.floor, box: new THREE.Box3().setFromObject(o) });
        break;
      case "nav":
        nav[u.id] = o.getWorldPosition(new THREE.Vector3());
        break;
      case "prop":
        props.push({ obj: o, asset: u.asset, foot: u.foot, yaw: u.yaw ?? 0 });
        break;
      case "light":
        lights.push({ position: o.getWorldPosition(new THREE.Vector3()), intensity: u.intensity ?? 1 });
        break;
      case "door": {
        const c = u.collider as number[];
        doors.push({
          obj: o,
          id: u.id,
          type: u.type,
          openAngle: u.openAngle ?? 0,
          slide: new THREE.Vector3(...((u.slide as [number, number, number]) ?? [0, 0, 0])),
          base: o.position.clone(),
          baseRotY: o.rotation.y,
          collider: new THREE.Box3(new THREE.Vector3(c[0], c[2], c[4]), new THREE.Vector3(c[1], c[3], c[5])),
          center: new THREE.Vector3(...(u.center as [number, number, number])),
          entry: !!u.entry,
          openness: 0,
          target: 0,
        });
        break;
      }
    }
  });
  return { root, elements, colliders, walkable, rooms, doors, nav, lights, props };
}

/** Sets a door's visual state for an openness in [0, 1]. */
export function applyDoor(d: DoorInfo) {
  const t = d.openness;
  const e = t * t * (3 - 2 * t);
  if (d.type === "swing") d.obj.rotation.y = d.baseRotY + d.openAngle * e;
  else d.obj.position.copy(d.base).addScaledVector(d.slide, e);
}

/**
 * Merges every static mesh below `group` into one mesh per material (doors and
 * helpers excluded) to cut draw calls. Geometry is expressed in `group`'s
 * local frame, so it can run on the whole villa or on a single element.
 */
export function mergeStatic(group: THREE.Object3D) {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  // bucket by material and by index presence (mergeGeometries needs a consistent set)
  const buckets = new Map<string, { mat: THREE.Material; list: THREE.BufferGeometry[] }>();
  const victims: THREE.Mesh[] = [];
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (let p: THREE.Object3D | null = mesh; p && p !== group; p = p.parent) if (isHelperGroup(p)) return;
    if (isInsideDoor(mesh, group)) return;
    const mat = mesh.material as THREE.Material;
    const g = mesh.geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld));
    for (const name of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.morphAttributes = {};
    const key = `${mat.uuid}:${g.index ? "i" : "n"}`;
    (buckets.get(key) ?? buckets.set(key, { mat, list: [] }).get(key)!).list.push(g);
    victims.push(mesh);
  });
  for (const m of victims) m.removeFromParent();
  for (const { mat, list } of buckets.values()) {
    const merged = mergeGeometries(list, false);
    for (const g of list) g.dispose();
    if (!merged) continue;
    merged.computeBoundingSphere();
    const mesh = new THREE.Mesh(merged, mat);
    mesh.name = `merged-${mat.name}`;
    group.add(mesh);
  }
}

/** Returns the walkable-surface height under (x, z) within the step limits. */
export function groundHeight(
  walkable: THREE.Mesh[],
  ray: THREE.Raycaster,
  x: number,
  z: number,
  feetY: number,
  stepUp = 0.5,
  stepDown = 0.65,
): number | null {
  ray.set(new THREE.Vector3(x, feetY + stepUp, z), new THREE.Vector3(0, -1, 0));
  ray.near = 0;
  ray.far = stepUp + stepDown;
  const hits = ray.intersectObjects(walkable, false);
  return hits.length ? hits[0].point.y : null;
}

export function roomAt(rooms: RoomInfo[], p: THREE.Vector3): RoomInfo | null {
  for (const r of rooms) if (r.box.containsPoint(p)) return r;
  return null;
}
