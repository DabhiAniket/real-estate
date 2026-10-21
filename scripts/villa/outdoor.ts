// Landscaping, modelled on public/images/reference/villa-exterior-pool.jpg:
// porcelain pool deck, raised infinity pool set in the lawn, covered terrace
// lounge, outdoor dining under the cantilever, palms, olives, grasses, the
// carport and garden lighting.

import { Builder, subtractRects } from "./kit.ts";
import * as F from "./furniture.ts";
import { DECK, GF, PLINTH, POOL } from "./plan.ts";

const S = "landscaping" as const;
const R0 = 0, RPI = Math.PI, RE = Math.PI / 2, RW = -Math.PI / 2;

export function buildOutdoor(b: Builder) {
  const { x0, x1, z0, z1, floor, coping: c } = POOL;
  const deckRects = subtractRects([DECK.x0, DECK.x1, DECK.z0, DECK.z1], []);

  b.element(S, "porcelain-deck", () => {
    for (const r of deckRects) {
      b.box("concrete-dark", r[0], r[1], 0, GF - 0.03, r[2], r[3]);
      b.box("porcelain-beige", r[0], r[1], GF - 0.03, GF, r[2], r[3]);
    }
    // two shallow steps down to the lawn along the deck's south edge
    b.box("porcelain-beige", DECK.x0, x0 - c, 0, 0.3, DECK.z0 - 0.35, DECK.z0);
    b.box("porcelain-beige", DECK.x0, x0 - c, 0, 0.15, DECK.z0 - 0.7, DECK.z0 - 0.35);
    b.box("porcelain-beige", x1 + c, DECK.x1, 0, 0.3, DECK.z0 - 0.35, DECK.z0);
    b.box("porcelain-beige", x1 + c, DECK.x1, 0, 0.15, DECK.z0 - 0.7, DECK.z0 - 0.35);
  }, { seq: 0 });
  for (const r of deckRects) b.walk(r[0], r[1], GF, r[2], r[3], "deck");
  for (const [a0, a1] of [[DECK.x0, x0 - c], [x1 + c, DECK.x1]] as const) {
    b.rampZ(a0, a1, DECK.z0 - 0.75, 0.03, DECK.z0, GF, "deck-steps");
  }

  b.element(S, "infinity-pool", () => {
    const t = 0.18;
    // raised white-rendered shell standing in the lawn
    b.box("plaster-exterior", x0 - c, x1 + c, floor - 0.25, GF - 0.02, z0 - c, z0);
    b.box("plaster-exterior", x0 - c, x0, floor - 0.25, GF - 0.02, z0, z1);
    b.box("plaster-exterior", x1, x1 + c, floor - 0.25, GF - 0.02, z0, z1);
    b.box("pool-tile", x0, x1, floor - 0.2, floor, z0, z1);
    b.box("pool-tile", x0, x1, floor, GF - 0.05, z1 - t, z1);
    b.box("pool-tile", x0, x0 + t, floor, GF - 0.05, z0, z1);
    b.box("pool-tile", x1 - t, x1, floor, GF - 0.05, z0, z1);
    // vanishing edge on the garden side: weir slightly below the water line
    b.box("pool-tile", x0, x1, floor, POOL.water - 0.02, z0, z0 + t);
    b.box("pool-tile", x0, x1, 0.05, 0.18, z0 - c + 0.05, z0 - 0.05);
    // white coping
    b.box("plaster-exterior", x0 - c, x1 + c, GF - 0.02, GF + 0.02, z1 - 0.02, z1 + 0.02);
    b.box("plaster-exterior", x0 - c, x0, GF - 0.02, GF + 0.02, z0 - c, z1);
    b.box("plaster-exterior", x1, x1 + c, GF - 0.02, GF + 0.02, z0 - c, z1);
    // entry steps at the east end
    for (let i = 0; i < 3; i++) {
      const top = GF - 0.3 - i * 0.32;
      b.box("pool-tile", x1 - t - 0.4 * (i + 1), x1 - t, floor, top, z1 - 1.6, z1 - t);
    }
    for (const x of [x0 + 2.5, (x0 + x1) / 2, x1 - 2.5]) b.box("light-pool", x - 0.12, x + 0.12, floor + 0.5, floor + 0.65, z1 - t - 0.01, z1 - t);
  }, { seq: 1 });
  b.walk(x0 - c, x0, GF + 0.02, z0 - c, z1, "pool-coping");
  b.walk(x1, x1 + c, GF + 0.02, z0 - c, z1, "pool-coping");

  b.element(S, "pool-water", () => {
    b.box("water", x0 + 0.18, x1 - 0.18, POOL.water - 0.02, POOL.water, z0 + 0.02, z1 - 0.18);
    b.box("water", x0, x1, 0.12, 0.16, z0 - c + 0.06, z0 - 0.06);
  }, { seq: 2 });

  // Loungers on the east deck, facing the pool
  for (const x of [6.7, 8.2, 9.7]) b.item(S, "pool-lounger", [x, GF, -11.05], RPI, () => F.lounger(b));
  b.item(S, "pool-side-table", [7.45, GF, -11.6], R0, () => F.sideTable(b));

  // Covered terrace lounge under the porcelain portico
  b.item(S, "terrace-sofa", [7.3, GF, -7.45], RPI, () => F.sofa(b, 2.6, "fabric-linen"));
  b.item(S, "terrace-coffee-table", [7.3, GF, -8.6], R0, () => F.coffeeTable(b, 1.1, 0.6, "porcelain-beige"));
  b.item(S, "terrace-chair", [5.5, GF, -8.6], RE, () => F.armchair(b, "fabric-linen"));

  // Outdoor dining under the cantilevered bedroom balcony
  b.item(S, "outdoor-dining-table", [-5.75, GF, -7.9], R0, () => F.outdoorTable(b, 2.0, 0.9));
  for (const x of [-6.45, -5.75, -5.05]) {
    b.item(S, "outdoor-dining-chair", [x, GF, -8.6], R0, () => F.diningChair(b, "fabric-grey"));
    b.item(S, "outdoor-dining-chair", [x, GF, -7.2], RPI, () => F.diningChair(b, "fabric-grey"));
  }

  // Palms and an olive in porcelain planters at the deck corners
  for (const [x, z, kind, seed] of [[-9.3, -11.8, "palm", 1], [10.4, -7.4, "palm", 2], [10.3, -12.0, "olive", 3]] as const) {
    b.item(S, `deck-${kind}`, [x, GF, z], R0, () => {
      b.box("porcelain-beige", -0.5, 0.5, 0, 0.55, -0.5, 0.5);
      b.box("soil", -0.45, 0.45, 0.55, 0.57, -0.45, 0.45);
      b.group([0, 0.57, 0], () => (kind === "palm" ? F.palm(b, 4.6) : F.oliveTree(b, 3.6, seed)));
    }, { collide: false });
    b.collider([x - 0.5, x + 0.5, GF, GF + 0.6, z - 0.5, z + 0.5], "deck-planter");
  }

  // Ornamental grasses and agaves around the pool and along the deck edge
  b.element(S, "pool-planting", () => {
    let i = 0;
    for (const [px, pz] of [[-8.3, -13.2], [-8.4, -14.4], [-8.2, -15.6], [-8.6, -16.7], [6.4, -13.4], [6.6, -14.7], [6.3, -16.0], [-10.5, -9.0], [-10.6, -10.3]] as const) {
      const y = px < -10 ? 0.03 : 0.03;
      b.group([px, y, pz], () => (i % 3 === 2 ? F.agave(b, 0.95, i) : F.grassClump(b, 1.0, i)), i);
      i++;
    }
  }, { seq: 6 });

  // Carport over the driveway, with the family car
  b.element(S, "carport", () => {
    const xs = [10.7, 14.3], zs = [-0.3, 5.3];
    for (const x of xs) for (const z of zs) b.box("metal-black", x - 0.08, x + 0.08, 0, 2.8, z - 0.08, z + 0.08);
    b.box("metal-black", 10.5, 14.5, 2.8, 2.95, zs[0] - 0.2, zs[1] + 0.2);
    for (let z = zs[0] - 0.1; z <= zs[1] + 0.1; z += 0.3) b.box("wood-oak", 10.6, 14.4, 2.95, 3.05, z - 0.04, z + 0.04);
    b.box("light-warm", 12.0, 13.0, 2.79, 2.8, 2.3, 2.6);
  }, { seq: 5 });
  for (const x of [10.7, 14.3]) for (const z of [-0.3, 5.3]) b.collider([x - 0.09, x + 0.09, 0, 2.8, z - 0.09, z + 0.09], "carport-post");
  b.item(S, "car", [12.5, 0.04, 2.5], R0, () => F.car(b));

  // Trees: a backdrop of tall pines along the boundary, olives in the garden
  const pines: [number, number, number][] = [
    [-14.6, -16.7, 9.5], [-14.7, -7.4, 8.5], [-14.6, 3.2, 9], [14.6, -16.4, 9], [14.7, -8.2, 8], [-12.8, 12.6, 8.5], [6.6, 13.4, 8],
  ];
  pines.forEach(([x, z, h], i) => {
    b.item(S, "stone-pine", [x, 0.03, z], i * 0.9, () => F.pineTree(b, h, 40 + i), { collide: false });
    b.collider([x - 0.25, x + 0.25, 0, 3, z - 0.25, z + 0.25], "tree-trunk");
  });
  const olives: [number, number, number][] = [[-6.2, 13.2, 4.2], [14.6, 9.6, 4.5], [-12.8, -14.6, 4.0], [-12.6, 6.5, 4.4]];
  olives.forEach(([x, z, h], i) => {
    b.item(S, "olive-tree", [x, 0.03, z], i * 1.3, () => F.oliveTree(b, h, 60 + i), { collide: false });
    b.collider([x - 0.25, x + 0.25, 0, 2.5, z - 0.25, z + 0.25], "tree-trunk");
  });

  // Planting beds along the front facade and hedges along the boundary
  b.element(S, "front-planting", () => {
    for (const [x0, x1] of [[PLINTH.x0, -2.2], [2.2, PLINTH.x1]] as const) {
      b.box("soil", x0, x1, 0.03, 0.15, PLINTH.z1, 7.6);
      b.box("porcelain-beige", x0, x1, 0, 0.3, 7.6, 7.7);
      for (let x = x0 + 0.45; x < x1 - 0.2; x += 0.9) {
        F.canopy(b, x, 0.42, 7.2, 0.45, 0.3, 0.32, 5, Math.round(x * 100));
        if (Math.round(x * 10) % 3 === 0) b.sphere("flower", [x + 0.2, 0.75, 7.3], [0.16, 0.16, 0.16]);
        else b.sphere("flower-white", [x - 0.15, 0.72, 7.35], [0.14, 0.14, 0.14]);
      }
    }
  }, { seq: 6 });
  b.collider([PLINTH.x0, -2.2, 0, 0.9, PLINTH.z1, 7.7], "planter-west");
  b.collider([2.2, PLINTH.x1, 0, 0.9, PLINTH.z1, 7.7], "planter-east");

  const hedges: [number, number, number, number][] = [
    [-15.7, -1.6, 15.25, 15.75], [1.6, 9.9, 15.25, 15.75], [-15.75, -15.25, -23.6, 15.0],
    [-15.6, 15.6, -23.75, -23.25], [15.25, 15.75, -23.6, -1.2],
  ];
  b.element(S, "boundary-hedges", () => {
    for (const [x0, x1, z0, z1] of hedges) {
      b.box("leaf-dark", x0 + 0.05, x1 - 0.05, 0.03, 1.0, z0 + 0.05, z1 - 0.05);
      // break up the box silhouette with clumps along the top and faces
      const alongX = x1 - x0 > z1 - z0;
      const len = alongX ? x1 - x0 : z1 - z0;
      for (let t = 0.3; t < len; t += 0.55) {
        const x = alongX ? x0 + t : (x0 + x1) / 2, z = alongX ? (z0 + z1) / 2 : z0 + t;
        b.blob(Math.round(t * 7) % 3 ? "leaf-dark" : "leaf", [x, 0.95, z], [0.62, 0.38, 0.62], t * 3);
      }
    }
  }, { seq: 6 });
  for (const [x0, x1, z0, z1] of hedges) b.collider([x0, x1, 0, 1.1, z0, z1], "hedge");

  // photoscanned shrubs (CC0) in the garden beds
  const shrubs: [number, number, number][] = [
    [-11.8, -5.6, 0.7], [-11.5, 7.6, 0.8], [-4.5, 10.2, 0.6], [4.0, 10.6, 0.7], [8.6, 11.8, 0.65], [-10.5, 0.2, 0.7], [12.0, -3.6, 0.7], [-11.5, -1.5, 0.6],
  ];
  shrubs.forEach(([x, z, r], i) => b.prop(S, "garden-shrub", [x, 0.03, z], (i % 4) * (Math.PI / 2), "shrub_02", [r * 2, r * 1.8, r * 2], { seq: 6 }));

  // Garden lighting
  b.element(S, "garden-bollards", () => {
    for (const z of [9.6, 12.0, 14.4]) for (const x of [-1.45, 1.45]) {
      b.cyl("metal-black", x, 0, 0.7, z, 0.07);
      b.cyl("light-warm", x, 0.55, 0.66, z, 0.072);
    }
    for (const [x, z] of [[-9.0, -17.4], [-2.0, -17.5], [4.0, -17.5], [11.6, -13.5], [-11.2, -12.0]] as const) {
      b.cyl("metal-black", x, 0, 0.6, z, 0.07);
      b.cyl("light-warm", x, 0.48, 0.57, z, 0.072);
    }
  }, { seq: 7 });
}
