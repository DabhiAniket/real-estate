// Client capability checks used to pick a rendering tier for the 3D scenes.

let webglCache: boolean | null = null;

export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Touch-first or small/low-memory devices get the lighter render tier. */
export function isLowPowerDevice(): boolean {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return coarse || window.innerWidth < 768 || (mem !== undefined && mem <= 4);
}
