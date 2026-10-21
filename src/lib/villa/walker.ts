// First-person locomotion over the villa's walkable surfaces with collision
// against its solid volumes. Pure three.js — no React — so it can be unit
// tested or reused outside the walkthrough canvas.

import * as THREE from "three";
import { applyDoor, groundHeight, type DoorInfo, type VillaIndex } from "./model.ts";

export const EYE_HEIGHT = 1.62;
const RADIUS = 0.22;
const BODY_LOW = 0.3; // obstacles lower than this above the feet are stepped over
const BODY_HIGH = 1.8;
const DOOR_OPEN_DIST = 2.0;
const DOOR_CLOSE_DIST = 2.8;

export interface MoveInput {
  forward: number; // −1..1
  strafe: number; // −1..1
  run: boolean;
}

export class Walker {
  feet = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  eyeY = 0;
  private ray = new THREE.Raycaster();
  private boxes: THREE.Box3[] = [];
  private v = new THREE.Vector3();
  private index: VillaIndex;

  constructor(index: VillaIndex) {
    this.index = index;
  }

  /** Places the walker so its eye is at `eye`; snaps feet to the ground below. */
  placeAtEye(eye: THREE.Vector3, yaw: number, pitch = 0) {
    const g = groundHeight(this.index.walkable, this.ray, eye.x, eye.z, eye.y - EYE_HEIGHT, 0.6, 1.5);
    this.feet.set(eye.x, g ?? eye.y - EYE_HEIGHT, eye.z);
    this.eyeY = this.feet.y + EYE_HEIGHT;
    this.yaw = yaw;
    this.pitch = pitch;
  }

  look(dx: number, dy: number) {
    this.yaw -= dx;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy, -1.35, 1.35);
  }

  /** Solid volumes overlapping the body's vertical span at the current feet height. */
  private gather() {
    const lo = this.feet.y + BODY_LOW, hi = this.feet.y + BODY_HIGH;
    const px = this.feet.x, pz = this.feet.z, reach = 3;
    this.boxes.length = 0;
    const consider = (b: THREE.Box3) => {
      if (b.max.y <= lo || b.min.y >= hi) return;
      if (b.min.x > px + reach || b.max.x < px - reach || b.min.z > pz + reach || b.max.z < pz - reach) return;
      this.boxes.push(b);
    };
    for (const b of this.index.colliders) consider(b);
    for (const d of this.index.doors) if (d.openness < 0.85) consider(d.collider);
  }

  /** Pushes a circle at (x, z) out of all gathered boxes. */
  private resolve(x: number, z: number): [number, number] {
    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const b of this.boxes) {
        const cx = THREE.MathUtils.clamp(x, b.min.x, b.max.x);
        const cz = THREE.MathUtils.clamp(z, b.min.z, b.max.z);
        const dx = x - cx, dz = z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= RADIUS * RADIUS) continue;
        if (d2 > 1e-10) {
          const d = Math.sqrt(d2);
          x = cx + (dx / d) * RADIUS;
          z = cz + (dz / d) * RADIUS;
        } else {
          // centre is inside the box: leave along the shallowest side
          const opts = [
            [b.min.x - RADIUS - x, 0], [b.max.x + RADIUS - x, 0],
            [0, b.min.z - RADIUS - z], [0, b.max.z + RADIUS - z],
          ].sort((p, q) => Math.abs(p[0]) + Math.abs(p[1]) - (Math.abs(q[0]) + Math.abs(q[1])));
          x += opts[0][0];
          z += opts[0][1];
        }
        moved = true;
      }
      if (!moved) break;
    }
    return [x, z];
  }

  /** Attempts to move to (x, z); returns false if there is no floor there. */
  private tryMove(x: number, z: number) {
    const [rx, rz] = this.resolve(x, z);
    const g = groundHeight(this.index.walkable, this.ray, rx, rz, this.feet.y);
    if (g === null) return false;
    this.feet.set(rx, g, rz);
    return true;
  }

  update(dt: number, input: MoveInput) {
    dt = Math.min(dt, 0.05);
    this.gather();
    const speed = input.run ? 4.4 : 2.4;
    const len = Math.hypot(input.forward, input.strafe);
    if (len > 0.01) {
      const f = input.forward / Math.max(1, len), s = input.strafe / Math.max(1, len);
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      // camera looks down −z at yaw 0
      const mx = (-sin * f + cos * s) * speed * dt;
      const mz = (-cos * f - sin * s) * speed * dt;
      const ox = this.feet.x, oz = this.feet.z;
      if (!this.tryMove(ox + mx, oz + mz)) {
        if (!this.tryMove(ox + mx, oz)) this.tryMove(ox, oz + mz);
      }
    } else {
      // keep resolving so a door closing nearby can't trap us
      const [rx, rz] = this.resolve(this.feet.x, this.feet.z);
      this.feet.x = rx;
      this.feet.z = rz;
    }
    const target = this.feet.y + EYE_HEIGHT;
    this.eyeY += (target - this.eyeY) * Math.min(1, dt * 12);
    this.updateDoors(dt);
  }

  updateDoors(dt: number, forced?: DoorInfo | null) {
    for (const d of this.index.doors) {
      if (d === forced) continue;
      this.v.set(d.center.x - this.feet.x, 0, d.center.z - this.feet.z);
      const dist = this.v.length();
      const sameLevel = Math.abs(d.center.y - 1 - this.feet.y) < 1.4;
      if (sameLevel && dist < DOOR_OPEN_DIST) d.target = 1;
      else if (!sameLevel || dist > DOOR_CLOSE_DIST) d.target = 0;
      stepDoor(d, dt);
    }
  }

  applyToCamera(camera: THREE.Camera) {
    camera.position.set(this.feet.x, this.eyeY, this.feet.z);
    camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }
}

export function stepDoor(d: DoorInfo, dt: number) {
  const rate = d.type === "slide" ? 1.3 : 1.6;
  if (d.openness !== d.target) {
    d.openness = d.target > d.openness ? Math.min(d.target, d.openness + dt * rate) : Math.max(d.target, d.openness - dt * rate);
    applyDoor(d);
  }
}
