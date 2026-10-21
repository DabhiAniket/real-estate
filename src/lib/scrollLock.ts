// Coordinates page-scroll locking with the Lenis smooth-scroll instance so an
// overlay can freeze the page and later restore the exact scroll position.

import type Lenis from "lenis";

let lenis: Lenis | null = null;
let saved: number | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function lockPageScroll() {
  if (saved !== null) return;
  saved = window.scrollY;
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockPageScroll() {
  if (saved === null) return;
  const y = saved;
  saved = null;
  document.documentElement.style.overflow = "";
  window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
  if (lenis) {
    lenis.start();
    lenis.scrollTo(y, { immediate: true, force: true });
  }
}
