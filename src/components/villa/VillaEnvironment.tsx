"use client";
/* eslint-disable react-hooks/immutability -- R3F scene code mutates three.js objects, door state and input refs imperatively inside useFrame and event handlers. */

import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import { EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

const SKY_HDR = "/hdri/sky_1k.hdr";
const SKY_JPG = "/hdri/sky_4k.jpg";

/**
 * Daylight shared by every villa canvas: a real captured sky (CC0 HDRI) for
 * image-based light and reflections, a matching sun for crisp shadows, and
 * screen-space ambient occlusion for contact shading.
 */
export default function VillaEnvironment({
  shadowSize = 2048,
  envIntensity = 0.6,
  fog = true,
  ao = "full",
}: {
  shadowSize?: number;
  envIntensity?: number;
  fog?: boolean;
  ao?: "full" | "half" | "off";
}) {
  const { scene } = useThree();
  const sky = useTexture(SKY_JPG);

  useEffect(() => {
    sky.mapping = THREE.EquirectangularReflectionMapping;
    sky.colorSpace = THREE.SRGBColorSpace;
    scene.background = sky;
    scene.backgroundIntensity = 0.9;
    scene.backgroundRotation.set(0, Math.PI * 0.85, 0);
    return () => {
      scene.background = null;
    };
  }, [scene, sky]);

  return (
    <>
      <Environment files={SKY_HDR} environmentIntensity={envIntensity} environmentRotation={[0, Math.PI * 0.85, 0]} />
      {fog && <fog attach="fog" args={["#d6e3ea", 90, 300]} />}
      <hemisphereLight args={["#e4ecf2", "#7a705c", 0.35]} />
      <directionalLight
        position={[-16, 26, -30]}
        intensity={3.6}
        color="#fff4e6"
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-near={1}
        shadow-camera-far={95}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={4}
      />
      {ao !== "off" ? (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={1.1} distanceFalloff={0.8} intensity={2.6} halfRes={ao === "half"} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={4}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  );
}
