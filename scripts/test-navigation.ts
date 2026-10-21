// Walkthrough connectivity + collision test. Drives the production Walker
// (src/lib/villa/walker.ts) through public/models/villa.glb along routes that
// visit every room on both floors, the stair flights, balconies, terraces,
// deck and garden, then probes walls, glazing, furniture, the pool, the plot
// boundary, the stair void and balcony railings.
//
//   npm run test:nav
//
// A scripted visitor steers straight at each waypoint, so routes go through
// door centres. Exits non-zero on any failure.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { analyzeVilla, roomAt } from "../src/lib/villa/model.ts";
import { Walker } from "../src/lib/villa/walker.ts";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../public/models/villa.glb");
const buf = readFileSync(file);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const gltf = await new Promise<{ scene: THREE.Group }>((res, rej) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(ab, "", res as never, rej));
const villa = analyzeVilla(gltf.scene);
const w = new Walker(villa);
w.placeAtEye(villa.nav.foyer, 0);

let failures = 0;
const visited = new Set<string>();

function goTo(label: string, x: number, z: number, expectY?: number) {
  for (let i = 0; i < 30 * 40; i++) {
    const dx = x - w.feet.x, dz = z - w.feet.z;
    if (Math.hypot(dx, dz) < 0.3) {
      const r = roomAt(villa.rooms, new THREE.Vector3(w.feet.x, w.feet.y + 0.5, w.feet.z));
      if (r) visited.add(r.label);
      if (expectY !== undefined && Math.abs(w.feet.y - expectY) > 0.12) {
        failures++;
        console.log(`FAIL ${label}: height ${w.feet.y.toFixed(2)} != ${expectY}`);
      }
      return;
    }
    w.yaw = Math.atan2(-dx, -dz);
    w.update(1 / 30, { forward: 1, strafe: 0, run: false });
  }
  failures++;
  console.log(`FAIL ${label}: stuck at (${w.feet.x.toFixed(2)}, ${w.feet.y.toFixed(2)}, ${w.feet.z.toFixed(2)})`);
  w.feet.set(x, w.feet.y, z); // continue testing later legs
}

function route(name: string, pts: [number, number, number?][]) {
  for (const [x, z, y] of pts) goTo(`${name} → (${x}, ${z})`, x, z, y);
}

function blocked(name: string, x: number, z: number, axis: "x" | "z", limit: number, dir: 1 | -1) {
  let crossed = false;
  for (let i = 0; i < 180; i++) {
    w.yaw = Math.atan2(-(x - w.feet.x), -(z - w.feet.z));
    w.update(1 / 30, { forward: 1, strafe: 0, run: true });
    const v = axis === "x" ? w.feet.x : w.feet.z;
    if ((v - limit) * dir > 0) crossed = true;
  }
  console.log(`${crossed ? "FAIL" : "ok  "} blocked: ${name}`);
  if (crossed) failures++;
}

const GF = 0.45, FF = 3.85, BAL = FF - 0.03;
route("living, lounge, deck", [[0, 3.8, GF], [2.6, 4.0], [4.4, 2.6], [7.6, 2.3], [7.6, 1.2], [7.8, 0.4], [7.8, -3], [5.2, -5.9], [5.2, -7.6, GF], [4.5, -8.0], [4.5, -9.7], [9.0, -9.7], [4.5, -9.7], [4.5, -8.0], [5.2, -7.6], [5.2, -5.9]]);
route("dining, passage, powder", [[6, -2.6], [1.0, -2.4], [0.5, -3.45], [-1.25, -3.45], [-1.25, -4.4], [-1.25, -5.2], [-1.25, -3.45]]);
route("kitchen, utility", [[-3.2, -3.45], [-3.6, -5.2], [-4.0, -2.3], [-4.0, -1.0], [-4.0, 0.3], [-4.0, -2.3], [-3.2, -3.45], [-1.25, -3.45], [0.5, -3.45], [1.0, -2.4], [1.2, 1.0], [0, 3]]);
route("guest suite", [[-1.8, 3.0], [-3.3, 3.0], [-5.0, 3.4], [-7.25, 2.6], [-7.25, 1.2], [-7.0, 0.3], [-7.25, 2.6], [-5.0, 3.4], [-3.3, 3.0], [-1.8, 3.0]]);
route("stairs up", [[-1.87, 2.2, GF], [-1.87, 1.2], [-1.87, -1.5, 2.15], [-0.63, -1.6, 2.15], [-0.63, 1.3], [-0.63, 2.2, FF]]);
route("bedroom 2, bath 2", [[0.5, 3.0, FF], [-1.8, 3.0], [-3.3, 3.0], [-5.0, 3.6], [-7.5, 2.6], [-7.5, 1.2], [-7.2, 0.4], [-7.5, 2.6], [-5.0, 3.6], [-3.3, 3.0], [-1.0, 3.0]]);
route("front balcony", [[1.6, 3.5], [1.6, 5.9], [0.9, 6.0], [0.9, 7.4, BAL], [0.9, 6.0]]);
route("master suite", [[1.5, 2.3], [3.3, 2.3], [4.5, 2.9], [6.6, 3.2], [8.3, 4.6], [9.8, 4.6, BAL], [8.3, 4.6], [7.5, 2.4], [7.5, 1.2], [7.5, 0.3], [7.0, -0.6], [7.0, -1.9], [6.6, -3.0], [7.0, -0.6], [7.5, 0.3], [7.5, 2.4], [4.5, 2.9], [3.3, 2.3], [1.5, 2.3]]);
route("study", [[1.25, 1.0], [1.25, -4.0], [3.3, -4.0], [3.8, -4.6], [1.25, -4.0]]);
route("pool terrace", [[1.25, -5.4], [1.8, -6.0], [1.8, -7.6, BAL], [1.8, -8.5], [6.5, -8.5], [9.0, -7.2], [6.5, -8.5], [1.8, -8.5], [1.8, -7.6], [1.8, -6.0], [1.25, -5.4], [1.25, -4.0]]);
route("bedroom 3 wing", [[1.25, -3.15], [-1.25, -3.15], [-1.25, -4.3], [-1.1, -4.8], [-1.25, -3.15], [-3.4, -3.15], [-5.5, -3.0], [-5.15, -5.9], [-5.15, -7.5, BAL], [-5.15, -5.9], [-4.25, -2.2], [-4.25, -1.0], [-4.25, 0.0], [-4.25, -2.2], [-3.4, -3.15], [-1.25, -3.15], [1.25, -3.15]]);
route("stairs down, out to the garden", [[1.25, 1.0], [-0.63, 2.2, FF], [-0.63, -1.5, 2.15], [-1.87, -1.6], [-1.87, 1.8], [-0.5, 3.0, GF], [0, 5.2], [0, 7.3, GF], [0, 9.5], [5, 8.3], [9.9, 8.0], [10.1, 6.0], [10.1, -6.3], [11.3, -6.6], [11.3, -8.3], [9.0, -9.7], [4.5, -9.7], [-2.6, -8.0], [-6, -10], [-9.0, -11.0], [-8.8, -13.6], [-9.5, -16], [-13.0, -3.0], [-13.0, 0.0], [-13.2, 9.6], [-8, 10], [0, 9.5]]);

w.feet.set(0, GF, 9.5); w.eyeY = GF + 1.62;
blocked("front wall beside the door", -4, 0, "z", 6.5, -1);
w.feet.set(4.4, GF, 2.6);
blocked("living-room glazing", 14, 2.6, "x", 9.0, 1);
w.feet.set(-1.0, GF, 4.5);
blocked("solid wall foyer → guest room", -6, 4.5, "x", -2.5, -1);
w.feet.set(4.4, GF, 2.6);
blocked("through the living sofa", 4.4, 6.0, "z", 4.25, 1);
w.feet.set(0, GF, 9.5);
blocked("out through the gate", 0, 25, "z", 16, 1);
w.feet.set(-1.0, GF, -11.5);
blocked("into the swimming pool", -1.0, -15, "z", -12.4, -1);
w.placeAtEye(new THREE.Vector3(-1.9, FF + 1.62, 3.5), 0);
blocked("into the stair void", -1.9, -1.0, "z", 1.45, -1);
w.placeAtEye(new THREE.Vector3(0, BAL + 1.62, 7.4), 0);
blocked("over the balcony railing", 0, 12, "z", 8.4, 1);

const missed = villa.rooms.filter((r) => r.floor !== "site" && r.label !== "Staircase" && !visited.has(r.label)).map((r) => r.label);
console.log(`rooms/zones reached: ${visited.size}; interior rooms not reached: ${missed.length ? missed.join(", ") : "none"}`);
if (missed.length) failures++;
console.log(failures ? `${failures} FAILURE(S)` : "ALL NAVIGATION CHECKS PASSED");
process.exit(failures ? 1 : 0);
