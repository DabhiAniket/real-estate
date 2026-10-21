// Assembly stages of the villa model. The generator (scripts/villa) tags every
// element group in public/models/villa.glb with one of these ids, and the
// scroll-driven assembly animates them in this order. Keep this file free of
// imports so the Node generator can load it directly.

export type StageId =
  | "blueprint"
  | "site-and-terrain"
  | "foundation"
  | "ground-slab"
  | "structural-frame"
  | "ground-floor-walls"
  | "upper-floor-structure"
  | "stairs-and-upper-walls"
  | "doors-windows-facade"
  | "roof-and-finishing"
  | "interior-fitout"
  | "furniture-and-lighting"
  | "landscaping"
  | "complete";

export interface StageInfo {
  id: StageId;
  title: string;
  detail: string;
  /** Portion of the scroll timeline (0–1) in which this stage assembles. */
  range: [number, number];
  /** Vertical travel (m) each element makes into its final position. */
  drop: number;
  /** Elements of this stage are removed again after this progress (e.g. the blueprint). */
  until?: number;
}

export const STAGES: StageInfo[] = [
  { id: "blueprint", title: "Blueprint", detail: "The plan set out on site: walls with their door openings, the column grid, pool and plot lines.", range: [0, 0.05], drop: 0, until: 0.112 },
  { id: "site-and-terrain", title: "Plot & Terrain", detail: "Graded plot, excavated foundation and pool pits, boundary walls and gates.", range: [0.05, 0.11], drop: -1.6 },
  { id: "foundation", title: "Foundation", detail: "Sixteen isolated pad footings, column stubs, plinth beams and the stone-faced plinth wall.", range: [0.11, 0.17], drop: 3 },
  { id: "ground-slab", title: "Ground Slab", detail: "Ground-floor slab with its marble, carpet and tile finishes, and the entrance porch.", range: [0.17, 0.22], drop: 3 },
  { id: "structural-frame", title: "Columns & Beams", detail: "Ground-floor RCC column grid and the beam frame that carries the upper floor.", range: [0.22, 0.28], drop: 4 },
  { id: "ground-floor-walls", title: "Ground-Floor Walls", detail: "Exterior envelope and partitions of the ground floor, with real door and window openings.", range: [0.28, 0.35], drop: 4 },
  { id: "upper-floor-structure", title: "Upper Slab & Structure", detail: "First-floor slab around the stair void, the balcony and terrace slabs, upper columns and roof beams.", range: [0.35, 0.42], drop: 4 },
  { id: "stairs-and-upper-walls", title: "Staircase & Upper Walls", detail: "Dog-leg concrete stair with oak treads, then every first-floor wall and partition.", range: [0.42, 0.49], drop: 4 },
  { id: "doors-windows-facade", title: "Doors, Glazing & Facade", detail: "Pivot front door, interior doors, sliding glass walls, anthracite glazing, timber and porcelain cladding.", range: [0.49, 0.57], drop: 3 },
  { id: "roof-and-finishing", title: "Roof & Finishing", detail: "Flat roofs with white fascias and timber soffits, stair tower, roof-terrace rail and glass balustrades.", range: [0.57, 0.64], drop: 5 },
  { id: "interior-fitout", title: "Kitchen, Baths & Built-ins", detail: "Kitchen cabinetry and appliances, bathroom fixtures, wardrobes, fireplace, ceilings and tiling.", range: [0.64, 0.74], drop: 2.4 },
  { id: "furniture-and-lighting", title: "Furniture & Lighting", detail: "Beds, sofas, dining, rugs, artwork, blinds, ceiling fans and the lighting plan, room by room.", range: [0.74, 0.84], drop: 2 },
  { id: "landscaping", title: "Garden, Pool & Driveway", detail: "Lawn, porcelain pool deck, infinity pool, driveway, carport, trees, palms and garden lighting.", range: [0.84, 0.93], drop: 3 },
  { id: "complete", title: "The Finished House", detail: "The completed, furnished residence — the same model you can walk through.", range: [0.93, 1], drop: 0 },
];

export const STAGE_IDS = STAGES.map((s) => s.id);
