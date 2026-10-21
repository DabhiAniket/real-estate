"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { VillaIndex } from "@/lib/villa/model";

/**
 * Places the CC0 photoscanned furniture and plants (public/models/props) at
 * the villa's prop anchors. Each model keeps its real proportions and is
 * scaled uniformly to its planned footprint (clamped near real scale),
 * centred and grounded on the anchor.
 */
export default function VillaProps({ villa, lowPower = false, clipPlanes }: { villa: VillaIndex; lowPower?: boolean; clipPlanes?: THREE.Plane[] }) {
  const assets = useMemo(() => [...new Set(villa.props.map((p) => p.asset))], [villa]);
  const urls = useMemo(() => assets.map((a) => `/models/props/${a}${lowPower ? "-512" : ""}.glb`), [assets, lowPower]);
  const gltfs = useGLTF(urls);

  useEffect(() => {
    const byAsset = new Map(assets.map((a, i) => [a, gltfs[i]]));
    const attached: THREE.Object3D[] = [];
    const materials = new Map<THREE.Material, THREE.Material>();
    for (const p of villa.props) {
      const gltf = byAsset.get(p.asset);
      if (!gltf) continue;
      const model = gltf.scene.clone(true);
      const holder = new THREE.Group();
      holder.rotation.y = p.yaw;
      holder.add(model);
      holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(holder);
      const size = box.getSize(new THREE.Vector3());
      const [w, , d] = p.foot;
      const fit = Math.min(w / Math.max(size.x, 1e-3), d / Math.max(size.z, 1e-3));
      const scale = THREE.MathUtils.clamp(fit, 0.7, 1.3);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -box.min.y, -center.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), -p.yaw);
      holder.scale.setScalar(scale);
      holder.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (clipPlanes) {
          // the assembly's section cut must apply to props too
          const m = mesh.material as THREE.Material;
          if (!materials.has(m)) {
            const c = m.clone();
            c.clippingPlanes = clipPlanes;
            c.clipIntersection = true;
            materials.set(m, c);
          }
          mesh.material = materials.get(m)!;
        }
      });
      p.obj.add(holder);
      attached.push(holder);
    }
    return () => {
      for (const h of attached) h.removeFromParent();
      for (const m of materials.values()) m.dispose();
    };
  }, [villa, assets, gltfs, clipPlanes]);

  return null;
}
