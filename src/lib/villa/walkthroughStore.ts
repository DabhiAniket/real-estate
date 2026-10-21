// Global open/close state for the villa walkthrough. The hero, the assembly
// section and the overlay all talk to this store; it also owns the scroll
// position so exiting the tour returns the visitor to exactly where they were.

import { useSyncExternalStore } from "react";
import { lockPageScroll, unlockPageScroll } from "@/lib/scrollLock";

export type Vec3 = [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
}

export interface TourPose {
  feet: Vec3;
  yaw: number;
  pitch: number;
}

export type TourStart =
  | { kind: "entrance"; from?: CameraPose; source: "hero" | "assembly" }
  | { kind: "resume"; pose: TourPose };

interface State {
  open: boolean;
  start: TourStart | null;
  lastPose: TourPose | null;
}

const STORAGE_KEY = "villa-tour-pose";

function readStoredPose(): TourPose | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TourPose) : null;
  } catch {
    return null;
  }
}

let state: State = { open: false, start: null, lastPose: null };
let hydrated = false;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    const pose = readStoredPose();
    if (pose) state = { ...state, lastPose: pose };
  }
  listeners.add(l);
  return () => listeners.delete(l);
}

const SERVER_STATE: State = { open: false, start: null, lastPose: null };

export function useWalkthrough() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

export function openWalkthrough(start: TourStart) {
  if (state.open) return;
  lockPageScroll();
  set({ open: true, start });
}

export function closeWalkthrough(pose: TourPose | null) {
  if (!state.open) return;
  if (pose) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pose));
    } catch {
      /* storage unavailable — resume still works for this page view */
    }
  }
  set({ open: false, start: null, lastPose: pose ?? state.lastPose });
  unlockPageScroll();
}
