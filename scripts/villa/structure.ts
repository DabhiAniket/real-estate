// Shell of the villa: site, foundation, frame, slabs, stair, walls with real
// openings, doors/windows and the roof/facade.

import * as THREE from "three";
import { Builder, subtractRects, type Box } from "./kit.ts";
import { canopy } from "./furniture.ts";
import {
  BALCONIES, DECK, EXT_T, FF, FF_CEIL, GF, GF_CEIL, GRID_X, GRID_Z, INT_T, PLINTH, PLOT, POOL, ROOF, ROOMS,
  SLAB, STAIR, WALLS, X0, X1, Z0, Z1, type Opening, type Wall,
} from "./plan.ts";

type Rect = [number, number, number, number];

const FOOTPRINT: Rect = [X0 - EXT_T / 2, X1 + EXT_T / 2, Z0 - EXT_T / 2, Z1 + EXT_T / 2];
const PIT: Rect = [PLINTH.x0, PLINTH.x1, PLINTH.z0, PLINTH.z1];
const POOL_RECT: Rect = [POOL.x0, POOL.x1, POOL.z0, POOL.z1];
/** Pool plus its raised coping — no lawn or ground walking inside this. */
const POOL_OUTER: Rect = [POOL.x0 - POOL.coping, POOL.x1 + POOL.coping, POOL.z0 - POOL.coping, POOL.z1];
const DRIVEWAY: Rect = [10.5, 14.5, -1, 16];
const FRONT_PATH: Rect = [-1.1, 1.1, 8.25, 16];
const STAIR_VOID: Rect = [STAIR.x0, STAIR.x1, STAIR.z0, STAIR.start];

// ---------------------------------------------------------------- site

export function buildSite(b: Builder) {
  const S = "site-and-terrain" as const;
  const L = "landscaping" as const;

  b.element(S, "surrounding-ground", () => {
    for (const r of subtractRects([-90, 90, -90, 90], [[PLOT.x0, PLOT.x1, PLOT.z0, PLOT.z1]])) {
      b.box("grass-dark", r[0], r[1], -0.06, -0.01, r[2], r[3]);
    }
  }, { seq: 0 });

  b.element(S, "street", () => {
    b.box("paver", -90, 90, -0.01, 0.12, 16.15, 18);
    b.box("concrete", -90, 90, -0.01, 0.14, 18, 18.2);
    b.box("asphalt", -90, 90, -0.03, 0.02, 18.2, 26);
    for (let x = -88; x < 90; x += 6) b.box("plaster-exterior", x, x + 3, 0.02, 0.025, 22.0, 22.15);
    b.box("paver", -90, 90, -0.01, 0.12, 26, 28);
  }, { seq: 0 });

  b.element(S, "neighbourhood-trees", () => {
    const spots: [number, number, number][] = [
      [-24, 6, 7], [-28, -10, 8], [-22, -32, 6.5], [24, 4, 7.5], [27, -14, 8], [20, -33, 6],
      [-8, -33, 7], [6, -34, 7.5], [-30, 22, 6], [-12, 31, 7], [8, 32, 6.5], [30, 30, 7],
    ];
    for (const [x, z, h] of spots) {
      b.cyl("bark", x, -0.01, h * 0.45, z, 0.22, true);
      canopy(b, x, h * 0.68, z, h * 0.32, h * 0.28, h * 0.32, 22, Math.round(x * 7 + z));
    }
  }, { seq: 0 });

  b.element(S, "graded-plot", () => {
    for (const r of subtractRects([PLOT.x0, PLOT.x1, PLOT.z0, PLOT.z1], [PIT, POOL_OUTER])) {
      b.box("soil", r[0], r[1], -1.45, 0, r[2], r[3]);
    }
    b.box("soil", PIT[0], PIT[1], -1.45, -1.3, PIT[2], PIT[3]);
    b.box("soil", POOL_OUTER[0], POOL_OUTER[1], POOL.floor - 0.45, POOL.floor - 0.3, POOL_OUTER[2], POOL_OUTER[3]);
  }, { seq: 1 });

  b.element(L, "lawn", () => {
    const holes: Rect[] = [PIT, POOL_OUTER, DRIVEWAY, FRONT_PATH, [-2.2, 2.2, 6.8, 8.25]];
    for (const r of subtractRects([PLOT.x0, PLOT.x1, PLOT.z0, PLOT.z1], holes)) {
      b.box("grass", r[0], r[1], 0, 0.03, r[2], r[3]);
    }
  }, { seq: 2 });

  // Walkable ground — everything inside the boundary except the pool.
  for (const r of subtractRects([PLOT.x0 + 0.13, PLOT.x1 - 0.13, PLOT.z0 + 0.13, PLOT.z1 - 0.13], [POOL_OUTER])) {
    b.walk(r[0], r[1], 0.03, r[2], r[3], "ground");
  }

  b.element(L, "driveway", () => {
    b.box("paver-dark", DRIVEWAY[0], DRIVEWAY[1], 0, 0.04, DRIVEWAY[2], DRIVEWAY[3]);
    for (let z = DRIVEWAY[2] + 0.6; z < DRIVEWAY[3]; z += 1.2) b.box("paver", DRIVEWAY[0] + 0.1, DRIVEWAY[1] - 0.1, 0.04, 0.045, z, z + 0.08);
    b.box("concrete", DRIVEWAY[0] - 0.12, DRIVEWAY[0], 0, 0.1, DRIVEWAY[2], DRIVEWAY[3]);
    b.box("concrete", DRIVEWAY[1], DRIVEWAY[1] + 0.12, 0, 0.1, DRIVEWAY[2], DRIVEWAY[3]);
  }, { seq: 3 });

  b.element(L, "front-path", () => {
    for (let z = FRONT_PATH[2] + 0.05; z < FRONT_PATH[3] - 0.3; z += 0.75) {
      b.box("porcelain-beige", -1.0, 1.0, 0, 0.05, z, z + 0.65);
    }
    b.box("gravel", -1.1, 1.1, 0, 0.025, FRONT_PATH[2], FRONT_PATH[3]);
    // stepping stones from the driveway to the porch
    for (let x = 2.6; x < 10.4; x += 0.9) b.box("porcelain-beige", x, x + 0.7, 0, 0.05, 7.85, 8.55);
  }, { seq: 3 });

  // Boundary wall with a pedestrian gate on the path and a vehicle gate on the driveway.
  const H = 1.8, T = 0.25;
  const bw = (name: string, box: Box) => {
    b.element(S, name, () => {
      b.box("porcelain-beige", box[0], box[1], 0, 0.45, box[4], box[5]);
      b.box("boundary-plaster", box[0], box[1], 0.45, H - 0.06, box[4], box[5]);
      b.box("porcelain-beige", box[0] - 0.03, box[1] + 0.03, H - 0.06, H, box[4] - 0.03, box[5] + 0.03);
    }, { seq: 4 });
    b.collider(box, name);
  };
  const fz = PLOT.z1, bz = PLOT.z0;
  bw("boundary-front-west", [PLOT.x0, -1.25, 0, H, fz - T / 2, fz + T / 2]);
  bw("boundary-front-mid", [1.25, 10.25, 0, H, fz - T / 2, fz + T / 2]);
  bw("boundary-front-east", [14.75, PLOT.x1, 0, H, fz - T / 2, fz + T / 2]);
  bw("boundary-rear", [PLOT.x0, PLOT.x1, 0, H, bz - T / 2, bz + T / 2]);
  bw("boundary-west", [PLOT.x0 - T / 2, PLOT.x0 + T / 2, 0, H, bz, fz]);
  bw("boundary-east", [PLOT.x1 - T / 2, PLOT.x1 + T / 2, 0, H, bz, fz]);
  b.element(S, "gate-pillars", () => {
    for (const x of [-1.25, 1.25, 10.25, 14.75]) {
      b.box("wood-cladding", x - 0.3, x + 0.3, 0, 2.2, fz - 0.3, fz + 0.3);
      b.box("light-warm", x - 0.12, x + 0.12, 1.9, 2.05, fz + 0.3, fz + 0.32);
    }
    b.box("frame-anthracite", 1.0, 1.5, 1.35, 1.65, fz + 0.3, fz + 0.32); // house number plate
  }, { seq: 4 });
  for (const x of [-1.25, 1.25, 10.25, 14.75]) b.collider([x - 0.3, x + 0.3, 0, 2.2, fz - 0.3, fz + 0.3], "gate-pillar");
}

// ---------------------------------------------------------------- blueprint

/** Plan set-out drawn on the site before construction starts. */
export function buildBlueprint(b: Builder) {
  const S = "blueprint" as const;
  const y0 = 0.035, y1 = 0.05, k = 0.035;
  const line = (x0: number, z0: number, x1: number, z1: number) => {
    if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) b.box("blueprint-line", Math.min(x0, x1), Math.max(x0, x1), y0, y1, z0 - k, z0 + k);
    else b.box("blueprint-line", x0 - k, x0 + k, y0, y1, Math.min(z0, z1), Math.max(z0, z1));
  };
  const rect = (x0: number, x1: number, z0: number, z1: number) => {
    line(x0, z0, x1, z0); line(x0, z1, x1, z1); line(x0, z0, x0, z1); line(x1, z0, x1, z1);
  };
  b.element(S, "blueprint-ground", () => {
    // levelled ground the set-out is drawn on; cleared once the plot is graded
    b.box("soil", PLOT.x0, PLOT.x1, -0.04, 0.0, PLOT.z0, PLOT.z1);
  }, { seq: -1 });
  b.element(S, "blueprint-site", () => {
    rect(PLOT.x0 + 0.3, PLOT.x1 - 0.3, PLOT.z0 + 0.3, PLOT.z1 - 0.3);
    rect(POOL.x0, POOL.x1, POOL.z0, POOL.z1);
    rect(DECK.x0, DECK.x1, DECK.z0, DECK.z1);
    rect(DRIVEWAY[0], DRIVEWAY[1], DRIVEWAY[2], DRIVEWAY[3]);
  }, { seq: 0 });
  b.element(S, "blueprint-grid", () => {
    for (const x of GRID_X) line(x, Z0 - 2, x, Z1 + 2);
    for (const z of GRID_Z) line(X0 - 2, z, X1 + 2, z);
  }, { seq: 1 });
  b.element(S, "blueprint-walls", () => {
    // ground-floor walls with their real door and window openings left open
    for (const w of WALLS.filter((w) => w.floor === 0)) {
      const u0 = Math.min(w.from, w.to), u1 = Math.max(w.from, w.to);
      const cuts = (w.open ?? []).map((o) => [o.c - o.w / 2, o.c + o.w / 2]).sort((p, q) => p[0] - q[0]);
      let cursor = u0;
      for (const [a, e] of [...cuts, [u1, u1]]) {
        if (a > cursor) w.axis === "x" ? line(cursor, w.at, a, w.at) : line(w.at, cursor, w.at, a);
        cursor = Math.max(cursor, e);
      }
    }
  }, { seq: 2 });
}

// ---------------------------------------------------------------- foundation

export function buildFoundation(b: Builder) {
  const S = "foundation" as const;
  b.element(S, "blinding-concrete", () => {
    b.box("concrete-dark", PIT[0] + 0.05, PIT[1] - 0.05, -1.3, -1.25, PIT[2] + 0.05, PIT[3] - 0.05);
  }, { seq: 0 });
  for (const x of GRID_X) for (const z of GRID_Z) {
    b.element(S, `footing`, () => {
      b.box("concrete", x - 0.8, x + 0.8, -1.25, -0.8, z - 0.8, z + 0.8);
      b.box("concrete", x - 0.45, x + 0.45, -0.8, -0.6, z - 0.45, z + 0.45);
      b.box("concrete", x - 0.17, x + 0.17, -0.6, 0.2, z - 0.17, z + 0.17);
    }, { seq: 1 });
  }
  b.element(S, "plinth-beams", () => {
    for (const z of GRID_Z) b.box("concrete", X0 - 0.15, X1 + 0.15, -0.25, 0.2, z - 0.15, z + 0.15);
    for (const x of GRID_X) b.box("concrete", x - 0.15, x + 0.15, -0.25, 0.2, Z0 - 0.15, Z1 + 0.15);
  }, { seq: 2 });
  b.element(S, "plinth-wall", () => {
    const t = 0.3;
    b.box("stone-cladding", PIT[0], PIT[1], -1.25, GF - 0.02, PIT[3] - t, PIT[3]);
    b.box("stone-cladding", PIT[0], PIT[1], -1.25, GF - 0.02, PIT[2], PIT[2] + t);
    b.box("stone-cladding", PIT[0], PIT[0] + t, -1.25, GF - 0.02, PIT[2], PIT[3]);
    b.box("stone-cladding", PIT[1] - t, PIT[1], -1.25, GF - 0.02, PIT[2], PIT[3]);
  }, { seq: 3 });
}

// ---------------------------------------------------------------- frame

export function buildFrame(b: Builder) {
  const S = "structural-frame" as const;
  const colSize = (x: number, z: number) => (Math.abs(x) === 9 || Math.abs(z) === 6.5 || (x === -2.5 && z === 1.5) ? 0.24 : 0.3);
  for (const [lvl, y0, y1] of [[0, 0.2, GF_CEIL], [1, FF - 0.02, FF_CEIL]] as const) {
    for (const x of GRID_X) for (const z of GRID_Z) {
      const s = colSize(x, z) / 2;
      b.element(lvl === 0 ? S : "upper-floor-structure", `column-l${lvl}`, () => {
        b.box("concrete", x - s, x + s, y0, y1, z - s, z + s);
      }, { floor: lvl, seq: lvl * 10 });
      b.collider([x - s, x + s, y0, y1, z - s, z + s], "column");
    }
    const by0 = (lvl === 0 ? GF_CEIL : FF_CEIL) - 0.45, by1 = lvl === 0 ? GF_CEIL : FF_CEIL;
    b.element(lvl === 0 ? S : "upper-floor-structure", `beams-l${lvl}`, () => {
      for (const z of GRID_Z) {
        const w = Math.abs(z) === 6.5 ? 0.12 : 0.125;
        if (Math.abs(z) === 1.5) {
          // the beam stops at the stair core so the flights keep their headroom
          b.box("concrete", X0, STAIR.x0, by0, by1, z - w, z + w);
          b.box("concrete", STAIR.x1, X1, by0, by1, z - w, z + w);
        } else {
          b.box("concrete", X0, X1, by0, by1, z - w, z + w);
        }
      }
      for (const x of GRID_X) {
        const w = Math.abs(x) === 9 ? 0.12 : 0.125;
        b.box("concrete", x - w, x + w, by0, by1, Z0, Z1);
      }
    }, { floor: lvl, seq: lvl * 10 + 1 });

    // Plastered casing over the exposed frame, applied with the interior fit-out
    // so the finished rooms show painted columns and beams, not raw concrete.
    b.element("interior-fitout", `frame-plaster-finish-l${lvl}`, () => {
      const p = 0.012;
      for (const x of GRID_X) for (const z of GRID_Z) {
        const s = colSize(x, z) / 2 + p;
        b.box("plaster-interior", x - s, x + s, lvl === 0 ? GF : FF, by0, z - s, z + s);
      }
      for (const z of GRID_Z) {
        const w = (Math.abs(z) === 6.5 ? 0.12 : 0.125) + p;
        if (Math.abs(z) === 1.5) {
          b.box("plaster-interior", X0, STAIR.x0, by0 - p, by1 - 0.035, z - w, z + w);
          b.box("plaster-interior", STAIR.x1, X1, by0 - p, by1 - 0.035, z - w, z + w);
        } else b.box("plaster-interior", X0, X1, by0 - p, by1 - 0.035, z - w, z + w);
      }
      for (const x of GRID_X) {
        const w = (Math.abs(x) === 9 ? 0.12 : 0.125) + p;
        b.box("plaster-interior", x - w, x + w, by0 - p, by1 - 0.035, Z0, Z1);
      }
    }, { floor: lvl, seq: 0 });
  }
}

// ---------------------------------------------------------------- floors + stair

function finishLayer(b: Builder, floor: 0 | 1, top: number) {
  for (const r of ROOMS.filter((r) => r.floor === floor)) {
    if (floor === 1 && r.label === "Staircase") continue;
    b.box(r.finish, r.rect[0], r.rect[1], top - 0.02, top, r.rect[2], r.rect[3]);
  }
}

export function buildFloors(b: Builder) {
  // Ground floor slab + finishes + porch
  b.element("ground-slab", "ground-slab", () => {
    b.box("concrete", PIT[0] + 0.3, PIT[1] - 0.3, 0.2, GF - 0.02, PIT[2] + 0.3, PIT[3] - 0.3);
    for (const r of subtractRects(PIT, [[X0, X1, Z0, Z1]])) b.box("porcelain-beige", r[0], r[1], GF - 0.02, GF, r[2], r[3]);
  }, { floor: 0, seq: 0 });
  b.element("ground-slab", "ground-floor-finishes", () => finishLayer(b, 0, GF), { floor: 0, seq: 1 });
  b.walk(PIT[0], PIT[1], GF, PIT[2], PIT[3], "ground-floor");

  b.element("ground-slab", "entrance-porch", () => {
    b.box("concrete", -2.0, 2.0, 0, GF - 0.03, PLINTH.z1, 7.6);
    b.box("porcelain-beige", -2.0, 2.0, GF - 0.03, GF, PLINTH.z1, 7.6);
    b.box("porcelain-beige", -1.6, 1.6, 0, 0.3, 7.6, 7.92);
    b.box("porcelain-beige", -1.6, 1.6, 0, 0.15, 7.92, 8.25);
  }, { floor: 0, seq: 2 });
  b.walk(-2.0, 2.0, GF, PLINTH.z1, 7.6, "porch");
  b.rampZ(-1.6, 1.6, 8.3, 0.03, 7.6, GF, "porch-steps");

  buildStair(b);

  // First floor slab around the stair void
  b.element("upper-floor-structure", "first-floor-slab", () => {
    for (const r of subtractRects(FOOTPRINT, [STAIR_VOID])) b.box("concrete", r[0], r[1], FF - SLAB, FF - 0.02, r[2], r[3]);
  }, { floor: 1, seq: 0 });
  b.element("upper-floor-structure", "first-floor-finishes", () => finishLayer(b, 1, FF), { floor: 1, seq: 1 });
  for (const r of subtractRects(FOOTPRINT, [STAIR_VOID])) b.walk(r[0], r[1], FF, r[2], r[3], "first-floor");

  for (const bal of BALCONIES) {
    const [x0, x1, z0, z1] = bal.rect;
    const top = FF - 0.03;
    b.element("upper-floor-structure", bal.label.toLowerCase().replace(/\s+/g, "-"), () => {
      // Reference facade: the bedroom balcony is a deep white rendered box,
      // the pool terrace a porcelain-clad slab; both have timber soffits.
      const terrace = bal.label === "Pool Terrace";
      const skin = terrace ? "porcelain-beige" : "plaster-exterior";
      const deep = bal.label === "Bedroom 3 Balcony" ? 0.75 : 0.35;
      b.box("plaster-exterior", x0, x1, FF - SLAB - 0.05, top - 0.03, z0, z1);
      b.box("porcelain-beige", x0, x1, top - 0.03, top, z0, z1);
      b.box("wood-cladding", x0 + 0.08, x1 - 0.08, FF - SLAB - deep, FF - SLAB - deep + 0.03, z0 + 0.08, z1);
      const y0 = FF - SLAB - deep, y1 = top + 0.06, k = 0.08;
      if (bal.open.includes("z0")) b.box(skin, x0 - k, x1 + k, y0, y1, z0 - k, z0 + 0.02);
      if (bal.open.includes("z1")) b.box(skin, x0 - k, x1 + k, y0, y1, z1 - 0.02, z1 + k);
      if (bal.open.includes("x0")) b.box(skin, x0 - k, x0 + 0.02, y0, y1, z0, z1);
      if (bal.open.includes("x1")) b.box(skin, x1 - 0.02, x1 + k, y0, y1, z0, z1);
      if (terrace) {
        // porcelain-clad end wall carrying the terrace down to the deck
        b.box("porcelain-beige", x1 - 0.3, x1 + k, 0, FF - SLAB, z0 - k, z1);
      }
    }, { floor: 1, seq: 2 });
    b.walk(x0, x1, top, z0, z1, "balcony");
    if (bal.label === "Pool Terrace") b.collider([x1 - 0.3, x1 + 0.08, 0, FF - SLAB, z0 - 0.08, z1], "terrace-end-wall");
  }
}

function buildStair(b: Builder) {
  const S = "stairs-and-upper-walls" as const;
  const { flightA: A, flightB: B, spine, riser: r, tread: t, start, landingZ, landing } = STAIR;
  b.element(S, "staircase-flight-1", () => {
    for (let k = 1; k <= 9; k++) {
      const top = GF + r * k;
      const z1 = start - t * (k - 1), z0 = start - t * k;
      b.box("concrete", A.x0, A.x1, GF, top - 0.04, z0, z1);
      b.box("wood-oak", A.x0, A.x1, top - 0.04, top, z0, z1 + 0.025);
    }
  }, { floor: 0, seq: 3 });
  b.element(S, "staircase-landing", () => {
    b.box("concrete", A.x0, B.x1, GF, landing - 0.04, STAIR.z0 + INT_T / 2, landingZ);
    b.box("wood-oak", A.x0, B.x1, landing - 0.04, landing, STAIR.z0 + INT_T / 2, landingZ + 0.025);
  }, { floor: 0, seq: 4 });
  b.element(S, "staircase-flight-2", () => {
    for (let k = 1; k <= 9; k++) {
      const top = landing + r * k;
      const z0 = landingZ + t * (k - 1), z1 = landingZ + t * k;
      b.box("concrete", B.x0, B.x1, GF, top - 0.04, z0, z1);
      b.box("wood-oak", B.x0, B.x1, top - 0.04, top, z0 - 0.025, z1);
    }
  }, { floor: 0, seq: 5 });
  b.element(S, "staircase-spine-wall", () => {
    b.box("plaster-interior", spine.x0, spine.x1, GF, FF + 1.0, landingZ, start);
    b.box("wood-walnut", spine.x0 - 0.02, spine.x1 + 0.02, FF + 1.0, FF + 1.05, landingZ, start);
  }, { floor: 0, seq: 6 });
  b.collider([spine.x0, spine.x1, GF, FF + 1.05, landingZ, start], "stair-spine");

  b.rampZ(A.x0, A.x1, start + 0.14, GF, landingZ, landing, "stair-flight-1");
  b.walk(A.x0, B.x1, landing, STAIR.z0 + INT_T / 2, landingZ, "stair-landing");
  b.rampZ(B.x0, B.x1, landingZ, landing, start + 0.12, FF, "stair-flight-2");
}

// ---------------------------------------------------------------- walls + openings

const DEFAULT_HEAD: Record<Opening["type"], number> = {
  door: 2.2, entry: 2.4, opening: 2.6, window: 2.4, glazing: 2.6, slider: 2.4,
};

/** Converts along-wall (u) / height (y) / across-wall (v) extents into a world box. */
function wallBox(w: Wall, u0: number, u1: number, y0: number, y1: number, v0: number, v1: number): Box {
  return w.axis === "x" ? [u0, u1, y0, y1, w.at + v0, w.at + v1] : [w.at + v0, w.at + v1, y0, y1, u0, u1];
}

function addBox(b: Builder, material: string, bx: Box) {
  return b.box(material, bx[0], bx[1], bx[2], bx[3], bx[4], bx[5]);
}

export function buildWalls(b: Builder) {
  for (const w of WALLS) {
    const base = w.floor === 0 ? GF : FF;
    const top = w.floor === 0 ? GF_CEIL : FF_CEIL;
    const t = w.ext ? EXT_T : INT_T;
    const material = w.ext ? "plaster-exterior" : "plaster-interior";
    const u0 = Math.min(w.from, w.to) - t / 2, u1 = Math.max(w.from, w.to) + t / 2;
    const openings = [...(w.open ?? [])].sort((a, c) => a.c - c.c);

    b.element(w.floor === 0 ? "ground-floor-walls" : "stairs-and-upper-walls", `wall-${w.name}`, () => {
      let cursor = u0;
      for (const o of openings) {
        const a = o.c - o.w / 2, e = o.c + o.w / 2;
        const head = base + (o.head ?? DEFAULT_HEAD[o.type]);
        if (a > cursor) {
          const bx = wallBox(w, cursor, a, base, top, -t / 2, t / 2);
          addBox(b, material, bx);
          b.collider(bx, w.name);
        }
        if (head < top) addBox(b, material, wallBox(w, a, e, head, top, -t / 2, t / 2));
        if (o.type === "window" || o.type === "glazing") {
          const sill = base + (o.sill ?? 0.9);
          if (sill > base + 0.01) addBox(b, material, wallBox(w, a, e, base, sill, -t / 2, t / 2));
          b.collider(wallBox(w, a, e, base, top, -t / 2, t / 2), `${w.name}-window`);
        }
        cursor = e;
      }
      if (cursor < u1) {
        const bx = wallBox(w, cursor, u1, base, top, -t / 2, t / 2);
        addBox(b, material, bx);
        b.collider(bx, w.name);
      }
    }, { floor: w.floor, seq: w.ext ? 0 : 1 });

    for (const o of openings) buildOpening(b, w, o, base, t);
  }
}

function outwardSign(w: Wall) {
  return w.at > 0 ? 1 : -1;
}

function buildOpening(b: Builder, w: Wall, o: Opening, base: number, t: number) {
  if (o.type === "opening") return;
  const S = "doors-windows-facade" as const;
  const a = o.c - o.w / 2, e = o.c + o.w / 2;
  const head = base + (o.head ?? DEFAULT_HEAD[o.type]);
  const name = o.id ?? `${o.type}-${w.name}`;

  if (o.type === "window" || o.type === "glazing") {
    const sill = base + (o.sill ?? 0.9);
    const f = 0.06;
    b.element(S, name, () => {
      const frameMat = w.ext ? "frame-anthracite" : "metal-black";
      addBox(b, frameMat, wallBox(w, a, a + f, sill, head, -0.06, 0.06));
      addBox(b, frameMat, wallBox(w, e - f, e, sill, head, -0.06, 0.06));
      addBox(b, frameMat, wallBox(w, a, e, sill, sill + f, -0.06, 0.06));
      addBox(b, frameMat, wallBox(w, a, e, head - f, head, -0.06, 0.06));
      const panes = Math.max(1, Math.round(o.w / 1.4));
      for (let i = 1; i < panes; i++) {
        const u = a + (o.w * i) / panes;
        addBox(b, frameMat, wallBox(w, u - 0.025, u + 0.025, sill, head, -0.05, 0.05));
      }
      if (o.type === "glazing" && head - sill > 2) {
        addBox(b, frameMat, wallBox(w, a, e, sill + 0.9, sill + 0.94, -0.04, 0.04));
      }
      addBox(b, "glass", wallBox(w, a + f, e - f, sill + f, head - f, -0.008, 0.008));
      if (w.ext && o.type === "window") {
        const s = outwardSign(w);
        const [v0, v1] = s > 0 ? [t / 2 - 0.02, t / 2 + 0.07] : [-t / 2 - 0.07, -t / 2 + 0.02];
        addBox(b, "porcelain-beige", wallBox(w, a - 0.05, e + 0.05, sill - 0.05, sill, v0, v1));
      }
    }, { floor: w.floor });
    return;
  }

  if (o.type === "slider") {
    buildSlider(b, w, o, base, head, t, name);
    return;
  }

  // Hinged door with a frame and an openable leaf.
  b.element(S, name, () => {
    const frameMat = o.type === "entry" ? "charcoal-cladding" : "wood-oak";
    const fv = t / 2 + 0.01;
    addBox(b, frameMat, wallBox(w, a, a + 0.05, base, head, -fv, fv));
    addBox(b, frameMat, wallBox(w, e - 0.05, e, base, head, -fv, fv));
    addBox(b, frameMat, wallBox(w, a, e, head - 0.05, head, -fv, fv));
    const hingeU = o.hinge === 1 ? e - 0.05 : a + 0.05;
    const leafDir = o.hinge === 1 ? -1 : 1;
    const L = o.w - 0.1 - 0.01;
    const swing = o.swing ?? 1;
    const openAngle = (w.axis === "x" ? -swing * leafDir : swing * leafDir) * (Math.PI / 2) * 0.97;
    const pivot = new THREE.Group();
    pivot.name = `door-${name}`;
    const pivotPos = w.axis === "x" ? new THREE.Vector3(hingeU, base, w.at) : new THREE.Vector3(w.at, base, hingeU);
    pivot.position.copy(pivotPos);
    const collider = wallBox(w, a, e, base, head, -t / 2, t / 2);
    const center = w.axis === "x" ? [o.c, base + 1, w.at] : [w.at, base + 1, o.c];
    pivot.userData = { kind: "door", id: name, type: "swing", openAngle, collider, center, floor: w.floor, entry: o.type === "entry" };
    b.parent.add(pivot);
    b.within(pivot, () => {
      const leafMat = o.type === "entry" ? "wood-walnut" : "wood-oak";
      const h = head - base - 0.06;
      const lt = o.type === "entry" ? 0.035 : 0.022;
      const leaf = (u0: number, u1: number, y0: number, y1: number, v0: number, v1: number, m: string) =>
        w.axis === "x" ? b.box(m, u0, u1, y0, y1, v0, v1) : b.box(m, v0, v1, y0, y1, u0, u1);
      const [lu0, lu1] = leafDir > 0 ? [0, L] : [-L, 0];
      leaf(lu0, lu1, 0.01, h, -lt, lt, leafMat);
      const hu = leafDir * (L - 0.09);
      if (o.type === "entry") {
        // full-height copper pull bar on both faces, plus inlaid grooves
        leaf(hu - 0.025, hu + 0.025, 0.5, h - 0.4, lt, lt + 0.06, "copper");
        leaf(hu - 0.025, hu + 0.025, 0.5, h - 0.4, -lt - 0.06, -lt, "copper");
        for (const y of [0.6, 1.2, 1.8]) leaf(lu0 + 0.08, lu1 - 0.08, y, y + 0.012, lt, lt + 0.004, "metal-black");
      } else {
        leaf(hu - 0.07, hu + 0.03, 1.0, 1.03, lt, lt + 0.05, "chrome");
        leaf(hu - 0.07, hu + 0.03, 1.0, 1.03, -lt - 0.05, -lt, "chrome");
      }
    });
  }, { floor: w.floor });
}

function buildSlider(b: Builder, w: Wall, o: Opening, base: number, head: number, t: number, name: string) {
  const a = o.c - o.w / 2, e = o.c + o.w / 2, c = o.c;
  b.element("doors-windows-facade", name, () => {
    const fm = w.ext ? "frame-anthracite" : "metal-black";
    addBox(b, fm, wallBox(w, a, a + 0.06, base, head, -0.09, 0.09));
    addBox(b, fm, wallBox(w, e - 0.06, e, base, head, -0.09, 0.09));
    addBox(b, fm, wallBox(w, a, e, head - 0.06, head, -0.09, 0.09));
    addBox(b, fm, wallBox(w, a, e, base - 0.01, base + 0.015, -0.09, 0.09));
    // fixed panel (inner track)
    const panel = (u0: number, u1: number, v: number) => {
      addBox(b, fm, wallBox(w, u0, u0 + 0.05, base + 0.015, head - 0.06, v - 0.025, v + 0.025));
      addBox(b, fm, wallBox(w, u1 - 0.05, u1, base + 0.015, head - 0.06, v - 0.025, v + 0.025));
      addBox(b, fm, wallBox(w, u0, u1, base + 0.015, base + 0.08, v - 0.025, v + 0.025));
      addBox(b, fm, wallBox(w, u0, u1, head - 0.11, head - 0.06, v - 0.025, v + 0.025));
      addBox(b, "glass", wallBox(w, u0 + 0.05, u1 - 0.05, base + 0.08, head - 0.11, v - 0.006, v + 0.006));
    };
    panel(a + 0.06, c + 0.03, -0.035);
    // sliding panel (outer track) in its own group so it can travel
    const slide = new THREE.Group();
    slide.name = `door-${name}`;
    const travel = -(c - a - 0.06);
    slide.userData = {
      kind: "door", id: name, type: "slide",
      slide: w.axis === "x" ? [travel, 0, 0] : [0, 0, travel],
      collider: wallBox(w, c, e, base, head, -t / 2, t / 2),
      center: w.axis === "x" ? [(c + e) / 2, base + 1, w.at] : [w.at, base + 1, (c + e) / 2],
      floor: w.floor,
    };
    b.parent.add(slide);
    b.within(slide, () => {
      panel(c - 0.03, e - 0.06, 0.035);
      const hu = c + 0.02;
      addBox(b, "chrome", wallBox(w, hu, hu + 0.03, base + 0.8, base + 1.3, 0.06, 0.085));
    });
  }, { floor: w.floor });
  b.collider(wallBox(w, a, c, base, head, -t / 2, t / 2), `${name}-fixed`);
}

// ---------------------------------------------------------------- roof + facade

/** Flat roof slab with a thick white rendered fascia and a timber soffit. */
function flatRoof(b: Builder, name: string, R: Rect, holes: Rect[], fascia = 0.55) {
  b.element("roof-and-finishing", name, () => {
    for (const r of subtractRects(R, holes)) b.box("plaster-exterior", r[0], r[1], FF_CEIL, ROOF, r[2], r[3]);
    const lo = FF_CEIL - (fascia - 0.3), hi = ROOF + 0.3, t = 0.22;
    b.box("plaster-exterior", R[0], R[1], lo, hi, R[3] - t, R[3]);
    b.box("plaster-exterior", R[0], R[1], lo, hi, R[2], R[2] + t);
    b.box("plaster-exterior", R[0], R[0] + t, lo, hi, R[2], R[3]);
    b.box("plaster-exterior", R[1] - t, R[1], lo, hi, R[2], R[3]);
    for (const r of subtractRects([R[0] + t, R[1] - t, R[2] + t, R[3] - t], [FOOTPRINT, ...holes])) {
      b.box("wood-cladding", r[0], r[1], lo, lo + 0.03, r[2], r[3]);
    }
    for (const r of subtractRects([R[0] + 0.3, R[1] - 0.3, R[2] + 0.3, R[3] - 0.3], holes.map((h) => [h[0] - 0.3, h[1] + 0.3, h[2] - 0.3, h[3] + 0.3] as Rect))) {
      b.box("porcelain-beige", r[0], r[1], ROOF, ROOF + 0.04, r[2], r[3]);
    }
  }, { floor: 1, seq: 0 });
}

export function buildRoofAndFacade(b: Builder) {
  const S = "roof-and-finishing" as const;
  const F = "doors-windows-facade" as const;
  const TOWER: Rect = [STAIR.x0, STAIR.x1, STAIR.z0, STAIR.start];

  // Main roof (open over the stair tower), the west roof that shelters the
  // cantilevered bedroom balcony, and the entrance canopy.
  flatRoof(b, "main-roof", [-9.35, 9.35, -6.85, 6.9], [TOWER]);
  flatRoof(b, "west-roof-overhang", [-9.55, -0.1, -8.95, -6.85], [], 0.7);
  flatRoof(b, "entrance-canopy", [-3.2, 3.2, 6.9, 8.9], [], 0.45);

  // Stair tower rising through the roof: timber cladding, black louvre band
  // and clerestory glazing that lights the stair hall.
  const T0 = ROOF, T1 = ROOF + 2.5;
  b.element(S, "stair-tower", () => {
    const [x0, x1, z0, z1] = TOWER, t = 0.18;
    b.box("wood-cladding", x0 - t, x1 + t, T0, T1, z1, z1 + t);
    b.box("wood-cladding", x0 - t, x0, T0, T1, z0 - t, z1 + t);
    b.box("wood-cladding", x1, x1 + t, T0, T1, z0 - t, z1 + t);
    // rear face: clerestory glazing below a black louvre band
    b.box("wood-cladding", x0 - t, x1 + t, T0, T0 + 0.5, z0 - t, z0);
    b.box("frame-anthracite", x0 - t, x1 + t, T0 + 0.5, T0 + 0.56, z0 - t, z0);
    b.box("glass", x0, x1, T0 + 0.56, T0 + 1.6, z0 - 0.1, z0 - 0.08);
    for (let x = x0 + 0.6; x < x1; x += 0.6) b.box("frame-anthracite", x - 0.03, x + 0.03, T0 + 0.56, T0 + 1.6, z0 - 0.13, z0 - 0.05);
    b.box("frame-anthracite", x0 - t, x1 + t, T0 + 1.6, T0 + 1.66, z0 - t, z0);
    for (let y = T0 + 1.72; y < T1 - 0.05; y += 0.11) b.box("metal-black", x0 - t, x1 + t, y, y + 0.06, z0 - t - 0.04, z0 - t + 0.04);
    b.box("plaster-exterior", x0 - t - 0.1, x1 + t + 0.1, T1, T1 + 0.25, z0 - t - 0.1, z1 + t + 0.1);
    b.box("plaster-interior", x0, x1, T1 - 0.02, T1, z0, z1);
  }, { floor: 1, seq: 2 });

  b.element(S, "roof-terrace-rail", () => {
    const R: Rect = [-9.25, 9.25, -6.75, 6.8];
    const y = ROOF + 0.3;
    const posts = (xa: number, za: number, xb: number, zb: number) => {
      const n = Math.max(1, Math.round(Math.hypot(xb - xa, zb - za) / 1.5));
      for (let i = 0; i <= n; i++) {
        const x = xa + ((xb - xa) * i) / n, z = za + ((zb - za) * i) / n;
        b.cyl("metal-steel", x, y, y + 1.0, z, 0.02, true);
      }
    };
    posts(R[0], R[2], R[1], R[2]); posts(R[0], R[3], R[1], R[3]); posts(R[0], R[2], R[0], R[3]); posts(R[1], R[2], R[1], R[3]);
    for (const h of [0.5, 1.0]) {
      b.box("metal-steel", R[0], R[1], y + h - 0.02, y + h, R[2] - 0.02, R[2] + 0.02);
      b.box("metal-steel", R[0], R[1], y + h - 0.02, y + h, R[3] - 0.02, R[3] + 0.02);
      b.box("metal-steel", R[0] - 0.02, R[0] + 0.02, y + h - 0.02, y + h, R[2], R[3]);
      b.box("metal-steel", R[1] - 0.02, R[1] + 0.02, y + h - 0.02, y + h, R[2], R[3]);
    }
  }, { floor: 1, seq: 3 });

  b.element(S, "roof-services", () => {
    for (const x of [-7.6, -6.6]) {
      b.box("plaster-exterior", x - 0.4, x + 0.4, ROOF + 0.04, ROOF + 0.7, 2.2, 2.6);
      b.cylAxis("metal-black", [x, ROOF + 0.37, 2.62], 0.22, 0.03, "z");
    }
  }, { floor: 1, seq: 3 });

  // ---- facade cladding (reference: white render, timber and beige porcelain)
  const zr = Z0 - EXT_T / 2, zf = Z1 + EXT_T / 2;
  b.element(F, "first-floor-slab-edge", () => {
    // white rendered band hiding the slab edge between the floors
    const y0 = GF_CEIL - 0.06, y1 = FF + 0.06, k = 0.03;
    const [fx0, fx1, fz0, fz1] = FOOTPRINT;
    b.box("plaster-exterior", fx0 - k, fx1 + k, y0, y1, fz1, fz1 + k);
    b.box("plaster-exterior", fx0 - k, fx1 + k, y0, y1, fz0 - k, fz0);
    b.box("plaster-exterior", fx0 - k, fx0, y0, y1, fz0, fz1);
    b.box("plaster-exterior", fx1, fx1 + k, y0, y1, fz0, fz1);
  }, { floor: 1, seq: 3 });
  b.element(F, "timber-pier-ground-floor", () => {
    // between the kitchen glazing and the dining/lounge glazing wall
    b.box("wood-cladding", -3.45, -1.62, GF, GF_CEIL, zr - 0.06, zr);
    b.box("wood-cladding", -0.88, 0.12, GF, GF_CEIL, zr - 0.06, zr);
    b.box("wood-cladding", -1.62, -0.88, GF, GF + 1.65, zr - 0.06, zr);
    b.box("wood-cladding", -1.62, -0.88, GF + 2.35, GF_CEIL, zr - 0.06, zr);
  }, { floor: 0, seq: 4 });
  b.element(F, "porcelain-cladding-ground-floor", () => {
    // west corner and the kitchen bay plinth
    b.box("porcelain-beige", -9.17, -8.05, 0, GF_CEIL, zr - 0.05, zr);
    // west face, split around the kitchen and guest-bath windows
    for (const [z0, z1] of [[zr, -6.06], [-4.74, -0.45], [0.45, zf]] as const) b.box("porcelain-beige", -9.17, -9.12, 0, GF_CEIL, z0, z1);
    b.box("porcelain-beige", 8.75, 9.17, 0, GF_CEIL, zr - 0.05, zr);
  }, { floor: 0, seq: 4 });
  b.element(F, "timber-box-frame-upper-east", () => {
    // timber box framing the study + master-bath glazing on the pool facade
    const x0 = 2.6, x1 = 9.17, y0 = FF - 0.08, y1 = FF_CEIL - 0.05, d = 0.45, k = 0.22;
    b.box("wood-cladding", x0, x1, y1 - k, y1, zr - d, zr);
    b.box("wood-cladding", x0, x0 + k, y0, y1, zr - d, zr);
    b.box("wood-cladding", x1 - k, x1, y0, y1, zr - d, zr);
    b.box("wood-cladding", 4.82, 5.18, y0, y1, zr - 0.06, zr);
  }, { floor: 1, seq: 5 });
  for (const [x0, x1] of [[2.6, 2.82], [8.95, 9.17]] as const) b.collider([x0, x1, FF, FF_CEIL, zr - 0.45, zr], "timber-frame-leg");
  b.element(F, "timber-panel-upper-west", () => {
    b.box("wood-cladding", -3.95, -1.62, FF, FF_CEIL, zr - 0.06, zr);
    b.box("wood-cladding", -0.88, -0.15, FF, FF_CEIL, zr - 0.06, zr);
    b.box("wood-cladding", -9.17, -7.5, FF, FF_CEIL, zr - 0.06, zr);
  }, { floor: 1, seq: 5 });
  b.element(F, "entrance-porcelain-cladding", () => {
    b.box("porcelain-beige", -2.5, -0.7, GF, GF_CEIL + 0.25, zf, zf + 0.05);
    b.box("porcelain-beige", 0.7, 2.5, GF, GF_CEIL + 0.25, zf, zf + 0.05);
    b.box("porcelain-beige", -0.7, 0.7, GF + 2.45, GF_CEIL + 0.25, zf, zf + 0.05);
    b.box("frame-anthracite", 0.85, 1.15, GF + 1.45, GF + 1.75, zf + 0.05, zf + 0.07); // house name plate
  }, { floor: 0, seq: 4 });
  b.element(F, "master-window-timber-frame", () => {
    const z0 = zf, z1 = z0 + 0.5;
    const x0 = 3.55, x1 = 7.95, y0 = FF + 0.25, y1 = FF + 2.75, k = 0.2;
    b.box("wood-cladding", x0, x1, y1 - k, y1, z0, z1);
    b.box("wood-cladding", x0, x1, y0, y0 + k, z0, z1);
    b.box("wood-cladding", x0, x0 + k, y0, y1, z0, z1);
    b.box("wood-cladding", x1 - k, x1, y0, y1, z0, z1);
  }, { floor: 1, seq: 5 });
  b.element(F, "front-timber-fins", () => {
    for (let x = -7.1; x <= -4.4; x += 0.27) b.box("wood-cladding", x - 0.025, x + 0.025, FF + 0.35, FF_CEIL - 0.15, zf + 0.25, zf + 0.45);
    b.box("frame-anthracite", -7.25, -4.25, FF_CEIL - 0.15, FF_CEIL - 0.08, zf, zf + 0.48);
    b.box("frame-anthracite", -7.25, -4.25, FF + 0.28, FF + 0.35, zf, zf + 0.48);
  }, { floor: 1, seq: 5 });

  // Glass balustrades — balconies, terrace and the stair void.
  const rail = (name: string, bx: Box) => {
    const [x0, x1, y0, y1, z0, z1] = bx;
    b.element(S, name, () => {
      const alongX = x1 - x0 > z1 - z0;
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (alongX) {
        b.box("glass", x0, x1, y0 + 0.04, y1, cz - 0.01, cz + 0.01);
        b.box("metal-steel", x0, x1, y0, y0 + 0.05, cz - 0.03, cz + 0.03);
      } else {
        b.box("glass", cx - 0.01, cx + 0.01, y0 + 0.04, y1, z0, z1);
        b.box("metal-steel", cx - 0.03, cx + 0.03, y0, y0 + 0.05, z0, z1);
      }
    }, { floor: 1, seq: 6 });
    b.collider(bx, name);
  };
  for (const bal of BALCONIES) {
    const [x0, x1, z0, z1] = bal.rect;
    const y0 = FF + 0.03, y1 = FF + 1.05, k = 0.06;
    for (const side of bal.open) {
      if (side === "x0") rail(`${bal.label} rail W`, [x0, x0 + k, y0, y1, z0, z1]);
      if (side === "x1") rail(`${bal.label} rail E`, [x1 - k, x1, y0, y1, z0, z1]);
      if (side === "z0") rail(`${bal.label} rail N`, [x0, x1, y0, y1, z0, z0 + k]);
      if (side === "z1") rail(`${bal.label} rail S`, [x0, x1, y0, y1, z1 - k, z1]);
    }
  }
  rail("stair-void-balustrade", [STAIR.x0 + 0.075, STAIR.spine.x0, FF, FF + 1.05, STAIR.start - 0.03, STAIR.start + 0.05]);
}

