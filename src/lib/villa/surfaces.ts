// Photographic surface finishes for the villa materials. The GLB carries
// named PBR materials; at runtime each name is bound to a CC0 texture set
// (public/textures, see CREDITS.json) projected triplanar in object space, so
// textures keep real-world scale on any box size and stay put while elements
// move during the assembly animation.

import * as THREE from "three";

export interface Surface {
  tex: string;
  /** Metres covered by one texture tile. */
  scale: number;
  normal?: number;
  /** Multiplies the texture colour. Omit to keep the texture's own colour. */
  tint?: string;
  /** Use the texture as luminance detail only, keeping the material colour. */
  lum?: boolean;
  /** Strength of that luminance detail (default 1). */
  lumAmount?: number;
  roughness?: number;
  metalness?: number;
}

export const SURFACES: Record<string, Surface> = {
  // reference exterior: timber-look cladding, beige large-format porcelain
  "wood-cladding": { tex: "oak_veneer_01", scale: 1.8, normal: 0.35, tint: "#d9a06c", roughness: 0.55 },
  "porcelain-beige": { tex: "large_floor_tiles_02", scale: 2.4, normal: 0.3, lum: true, lumAmount: 0.35, roughness: 0.45 },
  // reference interiors: carpets and upholstery keep their colour, texture adds weave
  "carpet-cream": { tex: "poly_wool_herringbone", scale: 0.35, normal: 0.6, lum: true },
  "carpet-beige": { tex: "poly_wool_herringbone", scale: 0.35, normal: 0.6, lum: true },
  "carpet-charcoal": { tex: "poly_wool_herringbone", scale: 0.35, normal: 0.6, lum: true },
  "velvet-blue": { tex: "poly_wool_herringbone", scale: 0.6, normal: 0.3, lum: true },
  "velvet-teal": { tex: "poly_wool_herringbone", scale: 0.6, normal: 0.3, lum: true },
  "suede-brown": { tex: "brown_leather", scale: 0.7, normal: 0.4, lum: true },
  "fabric-grey": { tex: "poly_wool_herringbone", scale: 0.5, normal: 0.8, lum: true },
  // painted render: texture adds only subtle variation and relief to a white base
  "plaster-exterior": { tex: "white_plaster_02", scale: 2.6, normal: 0.2, lum: true, lumAmount: 0.18, roughness: 0.85 },
  "plaster-interior": { tex: "white_plaster_02", scale: 2.5, normal: 0.15, lum: true, lumAmount: 0.12, roughness: 0.9 },
  "boundary-plaster": { tex: "white_stucco", scale: 2.0, normal: 0.5, lum: true, lumAmount: 0.25 },
  concrete: { tex: "concrete_floor_01", scale: 3, normal: 0.35, lum: true, lumAmount: 0.45 },
  "concrete-dark": { tex: "concrete_floor_01", scale: 3, normal: 0.6, tint: "#8b867e" },
  "stone-cladding": { tex: "white_sandstone_blocks_02", scale: 2.4, normal: 1, tint: "#f2e9da", roughness: 0.8 },
  "charcoal-cladding": { tex: "painted_concrete", scale: 3, normal: 0.4, tint: "#4a4d4b", roughness: 0.55 },
  "floor-marble": { tex: "marble_01", scale: 2.6, normal: 0.15, tint: "#fbf8f2", roughness: 0.12 },
  "floor-oak": { tex: "wood_floor", scale: 2.4, normal: 0.5, roughness: 0.45 },
  "floor-tile": { tex: "large_floor_tiles_02", scale: 2.2, normal: 0.6, roughness: 0.3 },
  "floor-stone": { tex: "stone_tiles_02", scale: 2.0, normal: 0.8, roughness: 0.6 },
  soil: { tex: "brown_mud_leaves_01", scale: 3, normal: 1 },
  grass: { tex: "leafy_grass", scale: 3.2, normal: 1, tint: "#d9e6c4", roughness: 0.95 },
  "grass-dark": { tex: "leafy_grass", scale: 4.5, normal: 0.8, tint: "#a7b593" },
  asphalt: { tex: "asphalt_02", scale: 4, normal: 0.8 },
  paver: { tex: "herringbone_pavement_02", scale: 2.4, normal: 0.8 },
  "paver-dark": { tex: "herringbone_pavement_02", scale: 2.4, normal: 0.8, tint: "#8e8a84" },
  gravel: { tex: "gravel", scale: 1.6, normal: 1 },
  "pool-tile": { tex: "long_white_tiles", scale: 1.4, normal: 0.5, tint: "#7fcbd8", roughness: 0.2 },
  bark: { tex: "bark_brown_02", scale: 1.1, normal: 1.3 },
  leaf: { tex: "leafy_grass", scale: 0.9, normal: 1.6, lum: true },
  "leaf-dark": { tex: "leafy_grass", scale: 0.9, normal: 1.6, lum: true },
  "leaf-light": { tex: "leafy_grass", scale: 0.9, normal: 1.6, lum: true },
  "leaf-olive": { tex: "leafy_grass", scale: 0.8, normal: 1.6, lum: true },
  agave: { tex: "painted_concrete", scale: 0.6, normal: 0.4, lum: true },
  "grass-blade": { tex: "painted_concrete", scale: 0.5, normal: 0.3, lum: true },
  travertine: { tex: "large_sandstone_blocks_01", scale: 3.2, normal: 0.7, tint: "#f4ece0", roughness: 0.75 },
  terracotta: { tex: "painted_concrete", scale: 1, normal: 0.5, lum: true },
  "wood-walnut": { tex: "walnut_veneer", scale: 1.3, normal: 0.3, roughness: 0.45 },
  "wood-oak": { tex: "oak_veneer_01", scale: 1.3, normal: 0.3, roughness: 0.5 },
  "cabinet-charcoal": { tex: "painted_concrete", scale: 2, normal: 0.15, lum: true },
  "cabinet-sage": { tex: "painted_concrete", scale: 2, normal: 0.15, lum: true },
  "cabinet-linen": { tex: "painted_concrete", scale: 2, normal: 0.15, lum: true },
  quartz: { tex: "marble_01", scale: 1.4, normal: 0.1, tint: "#fbfaf7", roughness: 0.15 },
  "fabric-linen": { tex: "poly_wool_herringbone", scale: 0.5, normal: 0.8, lum: true },
  "fabric-charcoal": { tex: "poly_wool_herringbone", scale: 0.5, normal: 0.8, lum: true },
  "fabric-sage": { tex: "poly_wool_herringbone", scale: 0.5, normal: 0.8, lum: true },
  "fabric-terracotta": { tex: "poly_wool_herringbone", scale: 0.5, normal: 0.8, lum: true },
  "fabric-navy": { tex: "poly_wool_herringbone", scale: 0.5, normal: 0.8, lum: true },
  bedding: { tex: "fabric_pattern_07", scale: 0.6, normal: 0.4, lum: true },
  curtain: { tex: "poly_wool_herringbone", scale: 0.4, normal: 0.5, lum: true },
  rug: { tex: "poly_wool_herringbone", scale: 0.7, normal: 1, lum: true },
  "rug-light": { tex: "poly_wool_herringbone", scale: 0.7, normal: 1, lum: true },
  leather: { tex: "brown_leather", scale: 0.8, normal: 0.6, roughness: 0.5 },
};

export const SURFACE_TEXTURES = [...new Set(Object.values(SURFACES).map((s) => s.tex))];

/** Texture URLs for a device tier (phones get 512 px albedo maps). */
export function textureUrls(lowPower = false) {
  const urls: Record<string, string> = {};
  for (const t of SURFACE_TEXTURES) {
    urls[`${t}:diff`] = `/textures/${t}/${lowPower ? "diff-512" : "diff"}.webp`;
    urls[`${t}:nor`] = `/textures/${t}/nor.webp`;
  }
  urls["leaf-atlas:diff"] = `/textures/foliage/${lowPower ? "leaf-atlas-512" : "leaf-atlas"}.webp`;
  return urls;
}

const VERT_DECL = /* glsl */ `
varying vec3 vTpPos;
varying vec3 vTpNrm;
varying vec3 vTpM0;
varying vec3 vTpM1;
varying vec3 vTpM2;
`;

const VERT_BODY = /* glsl */ `
vTpPos = position;
vTpNrm = normal;
vTpM0 = normalMatrix[0];
vTpM1 = normalMatrix[1];
vTpM2 = normalMatrix[2];
`;

const FRAG_DECL = /* glsl */ `
uniform sampler2D tpMap;
uniform sampler2D tpNormal;
uniform float tpScale;
uniform float tpNormalScale;
uniform float tpLum;
uniform float tpLumAmount;
varying vec3 vTpPos;
varying vec3 vTpNrm;
varying vec3 vTpM0;
varying vec3 vTpM1;
varying vec3 vTpM2;
vec3 tpN;
vec3 tpW;
vec3 tpP;
`;

const FRAG_MAP = /* glsl */ `
tpN = normalize(vTpNrm);
tpW = pow(abs(tpN), vec3(4.0));
tpW /= (tpW.x + tpW.y + tpW.z);
tpP = vTpPos / tpScale;
vec3 tpAlb = texture2D(tpMap, tpP.zy).rgb * tpW.x + texture2D(tpMap, tpP.xz).rgb * tpW.y + texture2D(tpMap, tpP.xy).rgb * tpW.z;
if (tpLum > 0.5) {
  float l = dot(tpAlb, vec3(0.2126, 0.7152, 0.0722));
  tpAlb = vec3(mix(1.0, clamp(0.55 + l * 1.1, 0.0, 1.3), tpLumAmount));
}
diffuseColor.rgb *= tpAlb;
`;

const FRAG_NORMAL = /* glsl */ `
{
  vec3 tx = texture2D(tpNormal, tpP.zy).xyz * 2.0 - 1.0;
  vec3 ty = texture2D(tpNormal, tpP.xz).xyz * 2.0 - 1.0;
  vec3 tz = texture2D(tpNormal, tpP.xy).xyz * 2.0 - 1.0;
  tx.xy *= tpNormalScale; ty.xy *= tpNormalScale; tz.xy *= tpNormalScale;
  // whiteout blend (Ben Golus, "Normal Mapping for a Triplanar Shader")
  tx = vec3(tx.xy + tpN.zy, abs(tx.z) * tpN.x);
  ty = vec3(ty.xy + tpN.xz, abs(ty.z) * tpN.y);
  tz = vec3(tz.xy + tpN.xy, abs(tz.z) * tpN.z);
  vec3 nObj = normalize(tx.zyx * tpW.x + ty.xzy * tpW.y + tz.xyz * tpW.z);
  normal = normalize(mat3(vTpM0, vTpM1, vTpM2) * nObj) * faceDirection;
}
`;

const patched = new WeakSet<THREE.Material>();

function patch(material: THREE.MeshStandardMaterial, s: Surface, diff: THREE.Texture, nor: THREE.Texture) {
  const uniforms = {
    tpMap: { value: diff },
    tpNormal: { value: nor },
    tpScale: { value: s.scale },
    tpNormalScale: { value: s.normal ?? 0.6 },
    tpLum: { value: s.lum ? 1 : 0 },
    tpLumAmount: { value: s.lumAmount ?? 1 },
  };
  if (!s.lum) material.color.set(s.tint ?? "#ffffff");
  if (s.roughness !== undefined) material.roughness = s.roughness;
  if (s.metalness !== undefined) material.metalness = s.metalness;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERT_DECL}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${VERT_BODY}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_DECL}`)
      .replace("#include <map_fragment>", `#include <map_fragment>\n${FRAG_MAP}`)
      .replace("#include <normal_fragment_maps>", FRAG_NORMAL);
  };
  material.customProgramCacheKey = () => "villa-triplanar-1";
  patched.add(material);
  material.needsUpdate = true;
}

/** Binds photographic surfaces to every named villa material below `root`. */
export function applySurfaces(root: THREE.Object3D, textures: Record<string, THREE.Texture>, anisotropy = 8) {
  for (const [key, tex] of Object.entries(textures)) {
    if (tex.userData.villaReady) continue;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = anisotropy;
    tex.colorSpace = key.endsWith(":diff") ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    tex.userData.villaReady = true;
  }
  const done = new Set<THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const m = mesh.material as THREE.MeshStandardMaterial;
    if (done.has(m) || patched.has(m)) return;
    done.add(m);
    if (m.name.startsWith("leaf-card")) {
      // photographed leaf atlas, alpha-tested so cards cut out cleanly and cast leaf shadows
      const atlas = textures["leaf-atlas:diff"];
      if (atlas) {
        m.map = atlas;
        m.alphaTest = 0.45;
        m.transparent = false;
        m.side = THREE.DoubleSide;
        m.needsUpdate = true;
      }
      return;
    }
    if (m.name === "glass") {
      m.color.set("#6f8a92");
      m.opacity = 0.32;
      m.roughness = 0.02;
      m.metalness = 0.25;
      m.envMapIntensity = 1.3;
    } else if (m.name === "water") {
      m.color.set("#2c8fa6");
      m.opacity = 0.78;
      m.roughness = 0.03;
      m.metalness = 0.35;
      m.envMapIntensity = 1.8;
    } else if (m.name === "mirror" || m.name === "chrome") {
      m.envMapIntensity = 1.6;
    }
    const s = SURFACES[m.name];
    if (!s) return;
    const diff = textures[`${s.tex}:diff`], nor = textures[`${s.tex}:nor`];
    if (diff && nor) patch(m, s, diff, nor);
  });
}
