"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { VILLA_URL, analyzeVilla, dequantize, mergeStatic, prepareScene, type VillaIndex } from "@/lib/villa/model";
import { applySurfaces, textureUrls } from "@/lib/villa/surfaces";

const TEXTURES_FULL = textureUrls(false);
const TEXTURES_LIGHT = textureUrls(true);

/**
 * Loads the shared villa GLB (cached across canvases) and returns a private
 * instance of it.
 *  - "static": merged per material for the hero and the walkthrough.
 *  - "assembly": per-element merge + cloned materials so the assembly can
 *    animate every element and apply its section cut without affecting
 *    other canvases.
 */
export function useVilla(mode: "static" | "assembly", { shadows = true, lowPower = false } = {}): VillaIndex {
  const gltf = useGLTF(VILLA_URL);
  const textures = useTexture(lowPower ? TEXTURES_LIGHT : TEXTURES_FULL) as Record<string, THREE.Texture>;
  const index = useMemo(() => {
    const root = gltf.scene.clone(true);
    if (mode === "assembly") {
      const cache = new Map<THREE.Material, THREE.Material>();
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const m = mesh.material as THREE.Material;
        if (!cache.has(m)) cache.set(m, m.clone());
        mesh.material = cache.get(m)!;
      });
    }
    dequantize(root);
    applySurfaces(root, textures);
    prepareScene(root, { shadows });
    const idx = analyzeVilla(root);
    // elements arrive pre-merged from the generator; the hero and the tour
    // merge across elements once more to cut draw calls
    if (mode === "static") mergeStatic(root);
    prepareScene(root, { shadows });
    return idx;
  }, [gltf, textures, mode, shadows]);

  useEffect(
    () => () => {
      index.root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.name.startsWith("merged-")) mesh.geometry.dispose();
      });
    },
    [index],
  );
  return index;
}

useGLTF.preload(VILLA_URL);
