// Architectural plan of the villa — the single source of truth for walls,
// openings, rooms and levels. Units are metres. +z faces the street (front),
// +x is east. The building footprint is 18 m × 13 m on two floors.

export const GF = 0.45; // ground-floor finished level (top of plinth)
export const FF = 3.85; // first-floor finished level
export const ROOF = 7.25; // top of roof slab
export const SLAB = 0.25;
export const GF_CEIL = FF - SLAB; // 3.60
export const FF_CEIL = ROOF - SLAB; // 7.00
export const EXT_T = 0.25;
export const INT_T = 0.15;
export const X0 = -9, X1 = 9, Z0 = -6.5, Z1 = 6.5;
export const PLINTH = { x0: -9.3, x1: 9.3, z0: -6.8, z1: 6.8 };
export const PLOT = { x0: -16, x1: 16, z0: -24, z1: 16 };

/** Stair core (dog-leg, 2 × 10 risers of 170 mm). */
export const STAIR = {
  x0: -2.5, x1: 0, z0: -2.3, z1: 1.5,
  flightA: { x0: -2.42, x1: -1.32 }, // rises toward −z
  spine: { x0: -1.32, x1: -1.18 },
  flightB: { x0: -1.18, x1: -0.08 }, // rises toward +z
  start: 1.5, // z of first riser / last riser
  landingZ: -1.02, // z where both flights meet the landing
  riser: 0.17,
  tread: 0.28,
  landing: GF + 1.7,
};

export type OpeningType = "door" | "entry" | "opening" | "window" | "glazing" | "slider";

export interface Opening {
  c: number; // centre along the wall
  w: number; // clear width
  type: OpeningType;
  sill?: number; // above finished floor
  head?: number; // above finished floor
  id?: string;
  hinge?: -1 | 1; // door hinge at start (-1) or end (+1) of the opening
  swing?: -1 | 1; // leaf swings toward −/+ normal (normal = +z for x-walls, +x for z-walls)
}

export interface Wall {
  floor: 0 | 1;
  axis: "x" | "z"; // "x": runs along x at z = at;  "z": runs along z at x = at
  at: number;
  from: number;
  to: number;
  ext?: boolean;
  open?: Opening[];
  name: string;
}

const W = (floor: 0 | 1, axis: "x" | "z", at: number, from: number, to: number, name: string, open: Opening[] = [], ext = false): Wall =>
  ({ floor, axis, at, from, to, name, open, ext });

export const WALLS: Wall[] = [
  // ---------------- Ground floor ----------------
  W(0, "x", Z1, X0, X1, "gf-front", [
    { c: -5.75, w: 2.4, type: "window", sill: 0.9, head: 2.4 },
    { c: 0, w: 1.3, type: "entry", head: 2.4, id: "front-door", hinge: -1, swing: -1 },
    { c: 5.75, w: 5.0, type: "glazing", sill: 0.05, head: 2.6 },
  ], true),
  // Pool facade: recessed, floor-to-ceiling bronze glazing under the terrace.
  W(0, "x", Z0, X0, X1, "gf-rear", [
    { c: -5.75, w: 4.6, type: "window", sill: 0.95, head: 2.6 },
    { c: -1.25, w: 0.6, type: "window", sill: 1.7, head: 2.3 },
    { c: 1.25, w: 2.2, type: "slider", head: 2.6, id: "dining-slider" },
    { c: 4.4, w: 3.4, type: "slider", head: 2.6, id: "lounge-slider" },
    { c: 7.45, w: 2.6, type: "glazing", sill: 0.05, head: 2.6 },
  ], true),
  W(0, "z", X0, Z0, Z1, "gf-west", [
    { c: 0, w: 0.8, type: "window", sill: 1.6, head: 2.3 },
    { c: -5.4, w: 1.2, type: "window", sill: 1.05, head: 2.25 },
  ], true),
  W(0, "z", X1, Z0, Z1, "gf-east", [
    { c: 4, w: 3, type: "window", sill: 0.6, head: 2.4 },
    { c: -4.5, w: 2.5, type: "window", sill: 0.6, head: 2.4 },
  ], true),
  W(0, "z", -2.5, Z0, Z1, "gf-x-2.5", [
    { c: -3.45, w: 1.6, type: "opening", head: 2.6 },
    { c: 3.0, w: 0.95, type: "door", id: "guest-door", hinge: -1, swing: -1 },
  ]),
  W(0, "x", 1.5, X0, -2.5, "gf-guest-north", [
    { c: -7.25, w: 0.85, type: "door", id: "guest-bath-door", hinge: -1, swing: -1 },
  ]),
  W(0, "z", -5.5, -1.5, 1.5, "gf-bath-utility"),
  W(0, "x", -1.5, X0, -2.5, "gf-kitchen-north", [
    { c: -4, w: 0.9, type: "door", id: "utility-door", hinge: 1, swing: 1 },
  ]),
  W(0, "z", 0, Z0, 1.5, "gf-x0", [
    { c: -3.45, w: 1.8, type: "opening", head: 2.6 },
  ]),
  W(0, "x", -2.3, -2.5, 0, "gf-core-back"),
  W(0, "x", -4.6, -2.5, 0, "gf-powder", [
    { c: -1.25, w: 0.8, type: "door", id: "powder-door", hinge: -1, swing: -1 },
  ]),
  W(0, "x", 1.5, -1.25, 0, "gf-under-stair"),
  W(0, "z", 2.5, 1.5, Z1, "gf-living-foyer", [
    { c: 4, w: 3, type: "opening", head: 2.6 },
  ]),
  W(0, "x", 1.5, 2.5, X1, "gf-living-lounge", [
    { c: 7.6, w: 2.4, type: "opening", head: 2.6 },
  ]),

  // ---------------- First floor ----------------
  W(1, "x", Z1, X0, X1, "ff-front", [
    { c: -5.75, w: 2.4, type: "window", sill: 0.75, head: 2.4 },
    { c: 0, w: 3.0, type: "slider", id: "upper-lounge-slider" },
    { c: 5.75, w: 3.6, type: "window", sill: 0.5, head: 2.4 },
  ], true),
  W(1, "x", Z0, X0, X1, "ff-rear", [
    { c: -5.75, w: 3.4, type: "slider", head: 2.6, id: "bedroom3-slider" },
    { c: -1.25, w: 0.6, type: "window", sill: 1.6, head: 2.3 },
    { c: 1.25, w: 2.1, type: "slider", head: 2.6, id: "terrace-slider" },
    { c: 3.75, w: 2.1, type: "glazing", sill: 0.05, head: 2.6 },
    { c: 7.0, w: 3.6, type: "glazing", sill: 0.05, head: 2.6 },
  ], true),
  W(1, "z", X0, Z0, Z1, "ff-west", [
    { c: 0, w: 0.8, type: "window", sill: 1.6, head: 2.3 },
  ], true),
  W(1, "z", X1, Z0, Z1, "ff-east", [
    { c: 4, w: 2.6, type: "slider", id: "master-slider" },
    { c: 0, w: 1.0, type: "window", sill: 1.5, head: 2.3 },
    { c: -4, w: 1.6, type: "window", sill: 1.4, head: 2.3 },
  ], true),
  W(1, "z", -2.5, Z0, Z1, "ff-x-2.5", [
    { c: -3.15, w: 0.95, type: "door", id: "bedroom3-door", hinge: 1, swing: -1 },
    { c: 3.0, w: 0.95, type: "door", id: "bedroom2-door", hinge: -1, swing: -1 },
  ]),
  W(1, "x", 1.5, X0, -2.5, "ff-bed2-north", [
    { c: -7.5, w: 0.85, type: "door", id: "bath2-door", hinge: -1, swing: -1 },
  ]),
  W(1, "z", -6, -1.5, 1.5, "ff-bath2-closet"),
  W(1, "x", -1.5, X0, -2.5, "ff-bed3-north", [
    { c: -4.25, w: 1.0, type: "door", id: "closet3-door", hinge: 1, swing: 1 },
  ]),
  W(1, "z", 0, Z0, 1.5, "ff-x0", [
    { c: -3.15, w: 1.5, type: "opening", head: 2.6 },
  ]),
  W(1, "x", -2.3, -2.5, 0, "ff-core-back"),
  W(1, "x", -4, -2.5, 0, "ff-bath3", [
    { c: -1.25, w: 0.8, type: "door", id: "bath3-door", hinge: -1, swing: -1 },
  ]),
  W(1, "z", 2.5, Z0, Z1, "ff-x2.5", [
    { c: -4, w: 0.9, type: "door", id: "study-door", hinge: -1, swing: 1 },
    { c: 2.3, w: 1.0, type: "door", id: "master-door", hinge: -1, swing: 1 },
  ]),
  W(1, "x", 1.5, 2.5, X1, "ff-master-dressing", [
    { c: 7.5, w: 1.2, type: "opening", head: 2.4 },
  ]),
  W(1, "x", -1.5, 2.5, X1, "ff-dressing-bath", [
    { c: 7, w: 0.9, type: "door", id: "master-bath-door", hinge: 1, swing: -1 },
  ]),
  W(1, "z", 5, Z0, -1.5, "ff-study-bath"),
];

export interface RoomDef {
  label: string;
  floor: 0 | 1;
  rect: [number, number, number, number]; // x0 x1 z0 z1
  finish: string;
}

export const ROOMS: RoomDef[] = [
  { label: "Entrance Foyer", floor: 0, rect: [-2.5, 2.5, 1.5, 6.5], finish: "floor-marble" },
  { label: "Living Room", floor: 0, rect: [2.5, 9, 1.5, 6.5], finish: "carpet-cream" },
  { label: "Guest Bedroom", floor: 0, rect: [-9, -2.5, 1.5, 6.5], finish: "carpet-beige" },
  { label: "Guest Bathroom", floor: 0, rect: [-9, -5.5, -1.5, 1.5], finish: "floor-tile" },
  { label: "Utility & Laundry", floor: 0, rect: [-5.5, -2.5, -1.5, 1.5], finish: "floor-tile" },
  { label: "Kitchen", floor: 0, rect: [-9, -2.5, -6.5, -1.5], finish: "floor-stone" },
  { label: "Staircase", floor: 0, rect: [-2.5, 0, -2.3, 1.5], finish: "floor-marble" },
  { label: "Service Passage", floor: 0, rect: [-2.5, 0, -4.6, -2.3], finish: "floor-marble" },
  { label: "Powder Room", floor: 0, rect: [-2.5, 0, -6.5, -4.6], finish: "floor-tile" },
  { label: "Dining Area", floor: 0, rect: [0, 4.5, -6.5, 1.5], finish: "carpet-cream" },
  { label: "Family Lounge", floor: 0, rect: [4.5, 9, -6.5, 1.5], finish: "floor-marble" },

  { label: "Upper Lounge", floor: 1, rect: [-2.5, 2.5, 1.5, 6.5], finish: "floor-oak" },
  { label: "Master Bedroom", floor: 1, rect: [2.5, 9, 1.5, 6.5], finish: "carpet-beige" },
  { label: "Master Dressing", floor: 1, rect: [2.5, 9, -1.5, 1.5], finish: "floor-oak" },
  { label: "Master Bathroom", floor: 1, rect: [5, 9, -6.5, -1.5], finish: "floor-tile" },
  { label: "Study", floor: 1, rect: [2.5, 5, -6.5, -1.5], finish: "floor-oak" },
  { label: "Upper Corridor", floor: 1, rect: [0, 2.5, -6.5, 1.5], finish: "floor-oak" },
  { label: "Bedroom 2", floor: 1, rect: [-9, -2.5, 1.5, 6.5], finish: "carpet-charcoal" },
  { label: "Bathroom 2", floor: 1, rect: [-9, -6, -1.5, 1.5], finish: "floor-tile" },
  { label: "Bedroom 3 Dressing", floor: 1, rect: [-6, -2.5, -1.5, 1.5], finish: "floor-oak" },
  { label: "Bedroom 3", floor: 1, rect: [-9, -2.5, -6.5, -1.5], finish: "carpet-beige" },
  { label: "Upper Passage", floor: 1, rect: [-2.5, 0, -4, -2.3], finish: "floor-oak" },
  { label: "Bathroom 3", floor: 1, rect: [-2.5, 0, -6.5, -4], finish: "floor-tile" },
];

/** Cantilevered first-floor balconies (outer edge rectangles). */
export const BALCONIES = [
  { label: "Front Balcony", rect: [-2.75, 2.75, 6.625, 8.4] as [number, number, number, number], open: ["x0", "x1", "z1"] },
  { label: "Master Balcony", rect: [9.125, 10.9, 2.2, 5.8] as [number, number, number, number], open: ["x1", "z0", "z1"] },
  { label: "Bedroom 3 Balcony", rect: [-9.3, -0.3, -8.6, -6.625] as [number, number, number, number], open: ["x0", "x1", "z0"] },
  { label: "Pool Terrace", rect: [0.3, 9.6, -9.0, -6.625] as [number, number, number, number], open: ["x0", "z0"] },
];

/** Structural grid (column centres). */
export const GRID_X = [-9, -2.5, 2.5, 9];
export const GRID_Z = [-6.5, -1.5, 1.5, 6.5];

/** Pool and deck. */
/** Porcelain pool deck between the house and the pool. */
export const DECK = { x0: -10, x1: 11, z0: -12.4, z1: -6.8, top: GF };
/** Raised infinity pool set into the lawn beyond the deck (coping at deck level). */
export const POOL = { x0: -7, x1: 5, z0: -16.6, z1: -12.4, water: GF - 0.04, floor: -1.1, coping: 0.35 };
