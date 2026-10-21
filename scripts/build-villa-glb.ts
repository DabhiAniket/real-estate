// Generates public/models/villa.glb — the single architectural source model
// shared by the scroll-driven assembly and the first-person walkthrough.
//
//   node scripts/build-villa-glb.ts
//
// Requires Node ≥ 22.18 (native TypeScript type stripping).

import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { STAGE_IDS } from "../src/lib/villa/stages.ts";
import { Builder } from "./villa/kit.ts";
import { mergeStatic } from "../src/lib/villa/model.ts";
import { BALCONIES, FF, FF_CEIL, GF, GF_CEIL, ROOMS, PLOT } from "./villa/plan.ts";
import { buildBlueprint, buildFloors, buildFoundation, buildFrame, buildRoofAndFacade, buildSite, buildWalls } from "./villa/structure.ts";
import { buildFinishes, buildFurniture } from "./villa/interiors.ts";
import { buildOutdoor } from "./villa/outdoor.ts";

// GLTFExporter's binary path uses FileReader, which Node lacks.
class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = `data:application/octet-stream;base64,${Buffer.from(buf).toString("base64")}`;
      this.onloadend?.();
    });
  }
}
(globalThis as unknown as { FileReader: typeof NodeFileReader }).FileReader = NodeFileReader;

const b = new Builder(STAGE_IDS);

buildBlueprint(b);
buildSite(b);
buildFoundation(b);
buildFrame(b);
buildFloors(b);
buildWalls(b);
buildRoofAndFacade(b);
buildFurniture(b);
buildFinishes(b);
buildOutdoor(b);

// Room volumes (used for the walkthrough HUD + minimap).
for (const r of ROOMS) {
  const [x0, x1, z0, z1] = r.rect;
  const staircase = r.label === "Staircase";
  const y0 = r.floor === 0 ? GF - 0.3 : FF - 0.3;
  const y1 = staircase ? FF_CEIL : r.floor === 0 ? GF_CEIL : FF_CEIL;
  if (staircase && r.floor === 1) continue;
  b.room(r.label, r.floor, x0, x1, z0, z1, y0, y1);
}
for (const bal of BALCONIES) {
  const [x0, x1, z0, z1] = bal.rect;
  b.room(bal.label, 1, x0, x1, z0, z1, FF - 0.3, FF_CEIL);
}
// Exterior zones — listed most specific first; the runtime picks the first hit.
const zones: [string, number, number, number, number][] = [
  ["Entrance Porch", -2.2, 2.2, 6.8, 8.3],
  ["Driveway & Carport", 10.4, 14.6, -1, 16],
  ["Pool Deck", -3, 11, -16, -6.8],
  ["Front Garden", PLOT.x0, PLOT.x1, 6.8, PLOT.z1],
  ["Rear Garden", PLOT.x0, PLOT.x1, PLOT.z0, -6.8],
  ["West Garden", PLOT.x0, -9.3, -6.8, 6.8],
  ["East Garden", 9.3, PLOT.x1, -6.8, 6.8],
];
for (const [label, x0, x1, z0, z1] of zones) b.room(label, "site", x0, x1, z0, z1, -2, 3.2);

// Entrance choreography markers (eye height 1.62 m above the walking surface).
b.navPoint("approach", 0, 0.03 + 1.62, 14.2);
b.navPoint("porch", 0, GF + 1.62, 7.25);
b.navPoint("threshold", 0, GF + 1.62, 6.1);
b.navPoint("foyer", 0, GF + 1.62, 4.6);
b.navPoint("front-door", 0, GF + 1.2, 6.5);
b.navPoint("house-center", 0, 3.2, 0);

b.root.updateMatrixWorld(true);

// Pre-merge each element's meshes by material (doors, prop anchors and helper
// volumes stay separate). The browser then animates ~400 elements instead of
// ~8,000 meshes and skips this work on load.
b.root.traverse((o) => {
  if (o.userData.element) mergeStatic(o);
});
b.root.updateMatrixWorld(true);

// ---- validation -----------------------------------------------------------
let meshes = 0;
const elementsPerStage = new Map<string, number>();
b.root.traverse((o) => {
  if ((o as THREE.Mesh).isMesh) meshes++;
  if (o.userData.element) elementsPerStage.set(o.userData.stage, (elementsPerStage.get(o.userData.stage) ?? 0) + 1);
});
const doors: string[] = [];
b.root.traverse((o) => { if (o.userData.kind === "door") doors.push(o.userData.id); });
for (const id of STAGE_IDS) {
  if (id !== "complete" && !elementsPerStage.get(id)) throw new Error(`Stage ${id} has no elements`);
}
console.log(`meshes: ${meshes}`);
console.log(`colliders: ${b.colliders.children.length}, walkable: ${b.walkable.children.length}, rooms: ${b.rooms.children.length}, doors: ${doors.length}`);
for (const id of STAGE_IDS) console.log(`  ${id.padEnd(22)} ${elementsPerStage.get(id)} elements`);

// ---- export ---------------------------------------------------------------
const exporter = new GLTFExporter();
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../public/models/villa.glb");
exporter.parse(
  b.root,
  (result) => {
    mkdirSync(dirname(out), { recursive: true });
    const raw = out.replace(/\.glb$/, ".raw.glb");
    writeFileSync(raw, Buffer.from(result as ArrayBuffer));
    // Meshopt geometry compression + quantisation (decoded by drei's useGLTF).
    const cli = resolve(dirname(fileURLToPath(import.meta.url)), "../node_modules/.bin/gltf-transform");
    execFileSync(cli, ["meshopt", raw, out], { stdio: "ignore" });
    unlinkSync(raw);
    console.log(`wrote ${out} (${((result as ArrayBuffer).byteLength / 1024).toFixed(0)} KiB before meshopt)`);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
  { binary: true, onlyVisible: false },
);
