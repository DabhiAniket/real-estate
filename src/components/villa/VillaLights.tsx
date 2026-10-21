"use client";

import type { LightAnchor } from "@/lib/villa/model";

/** Warm interior lights at the model's light anchors (the evening glow). */
export default function VillaLights({ lights, strength = 1 }: { lights: LightAnchor[]; strength?: number }) {
  return (
    <>
      {lights.map((l, i) => (
        <pointLight key={i} position={l.position} intensity={14 * l.intensity * strength} distance={9} decay={1.6} color="#ffcf96" />
      ))}
    </>
  );
}
