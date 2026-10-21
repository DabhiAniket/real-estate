// Room-by-room interiors, styled on the reference photographs in
// public/images/reference: built-ins (kitchen, baths, wardrobes, fireplace,
// ceilings, tiling) assemble in "interior-fitout"; loose furniture, rugs, art,
// blinds, fans and the lighting plan in "furniture-and-lighting".

import { Builder, subtractRects, type Floor } from "./kit.ts";
import * as F from "./furniture.ts";
import { EXT_T, FF, FF_CEIL, GF, GF_CEIL, ROOF, ROOMS, STAIR, X0, X1, Z0, Z1 } from "./plan.ts";

const R0 = 0, RPI = Math.PI, RE = Math.PI / 2, RW = -Math.PI / 2;
const FIT = "interior-fitout" as const;
const FUR = "furniture-and-lighting" as const;
/** Built-in, plumbed or fixed items belong to the fit-out stage. */
const BUILT_IN = /kitchen|utility|-wc|vanity|shower|tub|wardrobe|closet|hood|fireplace|ceiling|tiling|backsplash|panelling|handrail|tray/;
const stageFor = (name: string) => (BUILT_IN.test(name) ? FIT : FUR);

function lvl(floor: 0 | 1) {
  return floor === 0 ? GF : FF;
}

/** Glass shower screen with a collider (the tray itself is walk-over). */
function screen(b: Builder, floor: 0 | 1, x0: number, x1: number, z0: number, z1: number) {
  const y0 = lvl(floor);
  b.element(FIT, "shower-screen", () => {
    b.box("glass", x0, x1, y0 + 0.04, y0 + 2.05, z0, z1);
    const alongX = x1 - x0 > z1 - z0;
    if (alongX) b.box("chrome", x0, x1, y0 + 2.05, y0 + 2.08, z0 - 0.01, z1 + 0.01);
    else b.box("chrome", x0 - 0.01, x1 + 0.01, y0 + 2.05, y0 + 2.08, z0, z1);
  }, { floor });
  b.collider([x0 - 0.02, x1 + 0.02, y0, y0 + 2.08, z0 - 0.02, z1 + 0.02], "shower-screen");
}

export function buildFurniture(b: Builder) {
  const g = GF, f = FF, bal = FF - 0.03;
  const it = (floor: 0 | 1, name: string, at: [number, number, number], rotY: number, fn: () => void, collide = true) =>
    b.item(stageFor(name), name, at, rotY, fn, { floor, collide });
  // real photoscanned furniture (see scripts/fetch-cc0-props.mjs)
  const prop = (floor: 0 | 1, name: string, at: [number, number, number], rotY: number, asset: string, foot: [number, number, number], yaw = 0) =>
    b.prop(stageFor(name), name, at, rotY, asset, foot, { floor, yaw });

  // ------------------------------------------------ Ground floor
  // Foyer
  it(0, "foyer-console", [1.6, g, 6.175], RPI, () => F.consoleTable(b, 1.4));
  it(0, "foyer-shoe-cabinet", [-2.225, g, 4.9], RE, () => F.sideboard(b, 1.5));
  it(0, "foyer-plant", [-1.95, g, 6.0], R0, () => F.plant(b, 1.15));

  // Living room
  it(0, "living-fireplace", [4.4, g, 1.875], R0, () => F.fireplace(b, GF_CEIL - g));
  prop(0, "living-sofa", [4.4, g, 4.75], RPI, "sofa_03", [2.75, 0.9, 1.0]);
  prop(0, "living-coffee-table", [4.4, g, 3.55], R0, "modern_coffee_table_01", [1.2, 0.4, 0.6], Math.PI / 2);
  prop(0, "living-armchair", [7.25, g, 3.45], RW, "modern_arm_chair_01", [0.85, 1.0, 0.9]);
  prop(0, "living-side-table", [6.1, g, 5.0], R0, "side_table_01", [0.55, 0.55, 0.45]);
  it(0, "living-table-lamp", [6.1, g + 0.55, 5.0], R0, () => {
    b.cyl("ceramic", 0, 0, 0.36, 0, 0.07);
    b.cyl("lamp-shade-linen", 0, 0.34, 0.6, 0, 0.17);
  }, false);
  it(0, "living-floor-lamp", [8.4, g, 2.3], R0, () => F.floorLamp(b));
  it(0, "living-plant", [8.4, g, 5.75], R0, () => F.plant(b, 1.4));

  // Dining
  prop(0, "dining-table", [2.2, g, -3.9], R0, "round_wooden_table_01", [1.4, 0.76, 1.4]);
  for (let i = 0; i < 6; i++) {
    // chairs turned to face the table (colliders use their world bounding boxes)
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = 2.2 + Math.sin(a) * 1.02, z = -3.9 + Math.cos(a) * 1.02;
    b.prop(FUR, "dining-chair", [x, g, z], a + Math.PI, "dining_chair_02", [0.45, 0.95, 0.5], { floor: 0, collide: false });
    b.collider([x - 0.24, x + 0.24, g, g + 0.95, z - 0.24, z + 0.24], "dining-chair");
  }
  it(0, "dining-sideboard", [0.3, g, -1.3], RE, () => F.sideboard(b, 1.8));
  it(0, "dining-plant", [4.0, g, -6.0], R0, () => F.plant(b, 1.0));

  // Family lounge
  it(0, "lounge-media-unit", [8.65, g, -0.8], RW, () => F.tvUnit(b, 2.4));
  prop(0, "lounge-sofa", [5.4, g, -0.8], RE, "sofa_02", [2.2, 0.85, 0.95]);
  prop(0, "lounge-coffee-table", [7.0, g, -0.8], RE, "modern_coffee_table_01", [1.2, 0.4, 0.6], Math.PI / 2);
  // east side of the lounge, clear of the sliding door to the deck
  prop(0, "lounge-chair", [7.9, g, -3.5], RW, "mid_century_lounge_chair", [0.85, 0.95, 0.9]);
  prop(0, "lounge-chair", [7.9, g, -5.1], RW, "mid_century_lounge_chair", [0.85, 0.95, 0.9]);
  prop(0, "lounge-side-table", [7.95, g, -4.3], R0, "side_table_01", [0.5, 0.5, 0.42]);
  it(0, "lounge-plant", [8.5, g, -6.0], R0, () => F.plant(b, 1.2));

  // Kitchen
  it(0, "kitchen-rear-counter", [-5.9375, g, -6.075], R0, () => F.baseRun(b, 5.875, { sinkAt: 0.1875 }));
  it(0, "kitchen-side-counter", [-8.575, g, -4.0125], RE, () => F.baseRun(b, 3.525, { hobAt: -0.7125 }));
  it(0, "kitchen-tall-units", [-7.525, g, -1.895], RPI, () => F.tallUnits(b, 2.7));
  it(0, "kitchen-hood", [-8.625, g, -3.3], RE, () => F.hood(b), false);
  it(0, "kitchen-island", [-5.6, g, -4.0], R0, () => F.island(b, 2.4, 1.0));
  for (const x of [-6.3, -5.6, -4.9]) it(0, "kitchen-bar-stool", [x, g, -3.05], RPI, () => F.barStool(b));

  // Utility
  it(0, "utility-washer", [-5.125, g, 0.2], RE, () => F.washer(b));
  it(0, "utility-dryer", [-5.125, g, 0.85], RE, () => F.washer(b, true));
  it(0, "utility-sink-counter", [-2.875, g, 0.65], RW, () => F.baseRun(b, 1.4, { sinkAt: 0.2, finish: "cabinet-linen" }));

  // Guest bedroom
  it(0, "guest-bed", [-7.825, g, 4.0], RE, () => F.bed(b, 1.6, 2.1, "bedding", "fabric-sage", 1.0, "fabric-grey"));
  it(0, "guest-nightstand", [-8.6, g, 2.75], RE, () => F.nightstandStyled(b, "black-peg", "ceramic-linen"));
  it(0, "guest-nightstand", [-8.6, g, 5.25], RE, () => F.nightstandStyled(b, "black-peg", "ceramic-linen"));
  it(0, "guest-wardrobe", [-5.3, g, 1.875], R0, () => F.wardrobe(b, 2.6));
  it(0, "guest-desk", [-3.6, g, 6.05], RPI, () => F.desk(b, 1.3, 0.6));
  it(0, "guest-desk-chair", [-3.6, g, 5.45], R0, () => F.officeChair(b));
  prop(0, "guest-armchair", [-3.2, g, 4.4], RW, "ArmChair_01", [0.85, 1.07, 0.8]);
  it(0, "guest-bench", [-6.5, g, 4.0], RE, () => F.bench(b, 1.2));

  // Guest bathroom
  it(0, "guest-bath-shower", [-8.3875, g, -0.6625], RE, () => F.showerFixtures(b, 1.525, 0.975), false);
  screen(b, 0, -7.92, -7.88, -1.425, -0.25);
  it(0, "guest-bath-wc", [-6.6, g, -1.1], R0, () => F.wc(b));
  it(0, "guest-bath-vanity", [-5.825, g, 0.3], RW, () => F.vanity(b, 1.0));

  // Powder room
  it(0, "powder-wc", [-0.6, g, -6.05], R0, () => F.wc(b));
  it(0, "powder-vanity", [-2.175, g, -5.6], RE, () => F.vanity(b, 0.7));

  // ------------------------------------------------ First floor
  // Upper lounge
  it(1, "upper-lounge-sofa", [-1.95, f, 5.0], RE, () => F.sofa(b, 2.4, "fabric-navy"));
  it(1, "upper-lounge-table", [-0.6, f, 5.0], RE, () => F.coffeeTable(b, 1.0, 0.6, "wood-oak"));
  prop(1, "upper-lounge-chair", [0.75, f, 3.9], RW, "ArmChair_01", [0.8, 1.0, 0.78]);
  prop(1, "upper-lounge-chair", [0.75, f, 5.1], RW, "ArmChair_01", [0.8, 1.0, 0.78]);
  it(1, "upper-lounge-bookshelf", [2.25, f, 4.6], RW, () => F.bookshelf(b, 2.4, 2.2));
  it(1, "upper-lounge-plant", [-2.05, f, 2.05], R0, () => F.plant(b, 1.0));

  // Master bedroom
  it(1, "master-bed", [3.68, f, 4.6], RE, () => F.bed(b, 1.9, 2.15, "bedding", "fabric-grey", 1.45, "velvet-teal"));
  it(1, "master-nightstand", [2.95, f, 3.2], RE, () => F.nightstandStyled(b, "gold-ring", "black-shade"));
  it(1, "master-nightstand", [2.95, f, 6.0], RE, () => F.nightstandStyled(b, "gold-ring", "black-shade"));
  prop(1, "master-bench", [5.0, f, 4.6], RE, "Ottoman_01", [0.9, 0.5, 0.65]);
  it(1, "master-vanity-table", [5.6, f, 1.825], R0, () => F.desk(b, 1.2, 0.5));
  it(1, "master-vanity-stool", [5.6, f, 2.35], R0, () => F.ottoman(b, 0.45, 0.4, "fabric-linen"));
  it(1, "master-armchair", [8.1, f, 5.95], RPI, () => F.benchChair(b));
  it(1, "master-floor-lamp", [7.3, f, 6.1], R0, () => F.floorLamp(b));

  // Master dressing
  it(1, "dressing-wardrobe-north", [4.675, f, 1.125], RPI, () => F.wardrobe(b, 4.2, 2.6, 0.6, "wood-walnut"));
  it(1, "dressing-wardrobe-south", [4.475, f, -1.125], R0, () => F.wardrobe(b, 3.8, 2.6, 0.6, "wood-walnut"));
  it(1, "dressing-island", [4.6, f, 0], R0, () => F.ottoman(b, 1.2, 0.5, "leather"));
  it(1, "dressing-ottoman", [8.2, f, -0.6], R0, () => F.ottoman(b, 0.6, 0.6, "fabric-sage"));

  // Master bathroom
  it(1, "master-bath-vanity", [5.325, f, -3.3], RE, () => F.vanity(b, 1.8, 2));
  it(1, "master-bath-tub", [7.6, f, -5.9], R0, () => F.bathtub(b, 1.7, 0.8));
  it(1, "master-bath-shower", [8.3875, f, -3.15], RW, () => F.showerFixtures(b, 1.9, 0.975), false);
  screen(b, 1, 7.88, 7.92, -4.1, -2.95);
  screen(b, 1, 7.88, 8.875, -4.12, -4.08);
  it(1, "master-bath-wc", [5.55, f, -6.05], R0, () => F.wc(b));

  // Study
  it(1, "study-desk", [3.75, f, -6.05], R0, () => F.desk(b, 1.5));
  it(1, "study-chair", [3.75, f, -5.3], RPI, () => F.officeChair(b));
  it(1, "study-bookshelf", [4.75, f, -2.9], RW, () => F.bookshelf(b, 2.2, 2.2));
  it(1, "study-reading-chair", [3.1, f, -2.2], RE, () => F.armchair(b, "leather"));

  // Corridor
  it(1, "corridor-console", [0.25, f, -0.5], RE, () => F.consoleTable(b, 1.2, 0.35));

  // Bedroom 2
  it(1, "bedroom2-bed", [-7.825, f, 4.0], RE, () => F.bed(b, 1.6, 2.1, "bedding", "fabric-sage", 1.0, "fabric-grey"));
  it(1, "bedroom2-nightstand", [-8.6, f, 2.75], RE, () => F.nightstandStyled(b, "black-peg", "ceramic-linen"));
  it(1, "bedroom2-nightstand", [-8.6, f, 5.25], RE, () => F.nightstandStyled(b, "black-peg", "ceramic-linen"));
  it(1, "bedroom2-wardrobe", [-5.5, f, 1.875], R0, () => F.wardrobe(b, 2.6, 2.4, 0.6, "cabinet-sage"));
  it(1, "bedroom2-desk", [-3.6, f, 6.05], RPI, () => F.desk(b, 1.3, 0.6));
  it(1, "bedroom2-desk-chair", [-3.6, f, 5.45], R0, () => F.officeChair(b));
  prop(1, "bedroom2-armchair", [-3.2, f, 4.6], RW, "modern_arm_chair_01", [0.85, 1.0, 0.9]);

  // Bathroom 2
  it(1, "bath2-shower", [-8.4125, f, -0.6125], RE, () => F.showerFixtures(b, 1.625, 0.925), false);
  screen(b, 1, -7.97, -7.93, -1.425, -0.3);
  it(1, "bath2-wc", [-6.9, f, -1.1], R0, () => F.wc(b));
  it(1, "bath2-vanity", [-6.325, f, 0.25], RW, () => F.vanity(b, 0.9));

  // Bedroom 3 dressing
  it(1, "closet3-wardrobe-north", [-4.25, f, 1.125], RPI, () => F.wardrobe(b, 3.3, 2.4, 0.6, "cabinet-linen"));
  it(1, "closet3-wardrobe-west", [-5.625, f, -0.4], RE, () => F.wardrobe(b, 1.8, 2.4, 0.6, "cabinet-linen"));

  // Bedroom 3
  it(1, "bedroom3-bed", [-7.825, f, -4.0], RE, () => F.bed(b, 1.6, 2.1, "bedding", "fabric-grey", 1.4, "velvet-teal"));
  it(1, "bedroom3-nightstand", [-8.55, f, -2.7], RE, () => F.nightstandStyled(b, "gold-ring", "black-shade"));
  it(1, "bedroom3-nightstand", [-8.55, f, -5.3], RE, () => F.nightstandStyled(b, "gold-ring", "black-shade"));
  it(1, "bedroom3-desk", [-7.3, f, -1.875], RPI, () => F.desk(b, 1.4, 0.6));
  it(1, "bedroom3-desk-chair", [-7.3, f, -2.6], R0, () => F.officeChair(b));
  it(1, "bedroom3-armchair", [-3.3, f, -5.6], RW, () => F.benchChair(b));

  // Bathroom 3
  it(1, "bath3-shower", [-1.9375, f, -5.7875], R0, () => F.showerFixtures(b, 0.975, 1.175), false);
  screen(b, 1, -2.425, -1.75, -5.22, -5.18);
  it(1, "bath3-wc", [-0.5, f, -6.05], R0, () => F.wc(b));
  it(1, "bath3-vanity", [-0.325, f, -4.9], RW, () => F.vanity(b, 0.8));

  // Balconies
  it(1, "front-balcony-chair", [-1.85, bal, 7.45], R0, () => F.outdoorChair(b));
  it(1, "front-balcony-chair", [-0.55, bal, 7.45], R0, () => F.outdoorChair(b));
  it(1, "front-balcony-table", [-1.2, bal, 7.95], R0, () => F.sideTable(b));
  it(1, "front-balcony-planter", [2.25, bal, 7.9], R0, () => F.plant(b, 0.9));
  it(1, "master-balcony-chair", [10.15, bal, 3.0], RE, () => F.outdoorChair(b));
  it(1, "master-balcony-table", [10.15, bal, 3.8], R0, () => F.sideTable(b));
  it(1, "master-balcony-planter", [10.45, bal, 5.35], R0, () => F.plant(b, 0.8));
  it(1, "terrace-chair", [4.2, bal, -7.95], RPI, () => F.outdoorChair(b));
  it(1, "terrace-chair", [5.6, bal, -7.95], RPI, () => F.outdoorChair(b));
  it(1, "terrace-table", [4.9, bal, -7.25], R0, () => F.sideTable(b));
  it(1, "terrace-planter", [9.0, bal, -8.15], R0, () => F.plant(b, 0.9));
  it(1, "terrace-planter", [0.5, bal, -8.15], R0, () => F.plant(b, 0.8));
}

// ---------------------------------------------------------------- finishes

type Face = "+x" | "-x" | "+z" | "-z";

/** A flat panel hung on a wall face (art, mirror, cladding). */
function panel(b: Builder, material: string, face: Face, at: number, u0: number, u1: number, y0: number, y1: number, depth = 0.02) {
  if (face === "+x") return b.box(material, at, at + depth, y0, y1, u0, u1);
  if (face === "-x") return b.box(material, at - depth, at, y0, y1, u0, u1);
  if (face === "+z") return b.box(material, u0, u1, y0, y1, at, at + depth);
  return b.box(material, u0, u1, y0, y1, at - depth, at);
}

function art(b: Builder, floor: Floor, face: Face, at: number, uc: number, yc: number, w: number, h: number, colour: string) {
  b.element(stageFor("artwork"), "artwork", () => {
    panel(b, "wood-walnut", face, at, uc - w / 2, uc + w / 2, yc - h / 2, yc + h / 2, 0.03);
    const off = face === "+x" || face === "+z" ? 0.03 : -0.03;
    panel(b, "bedding", face, at + off, uc - w / 2 + 0.04, uc + w / 2 - 0.04, yc - h / 2 + 0.04, yc + h / 2 - 0.04, 0.005);
    panel(b, colour, face, at + off * 1.2, uc - w / 4, uc + w / 6, yc - h / 4, yc + h / 5, 0.006);
  }, { floor });
}

function mirror(b: Builder, floor: 0 | 1, face: Face, at: number, u0: number, u1: number, y0: number, y1: number) {
  b.element(stageFor("mirror"), "mirror", () => {
    panel(b, "metal-black", face, at, u0 - 0.02, u1 + 0.02, y0 - 0.02, y1 + 0.02, 0.02);
    panel(b, "mirror", face, at + (face === "+x" || face === "+z" ? 0.02 : -0.02), u0, u1, y0, y1, 0.005);
  }, { floor });
}

function rug(b: Builder, floor: 0 | 1, cx: number, cz: number, sx: number, sz: number, material = "rug") {
  const y = lvl(floor);
  b.element(stageFor("rug"), "rug", () => {
    b.box(material, cx - sx / 2, cx + sx / 2, y, y + 0.012, cz - sz / 2, cz + sz / 2);
    b.box("rug-light", cx - sx / 2 + 0.15, cx + sx / 2 - 0.15, y + 0.012, y + 0.014, cz - sz / 2 + 0.15, cz - sz / 2 + 0.2);
    b.box("rug-light", cx - sx / 2 + 0.15, cx + sx / 2 - 0.15, y + 0.012, y + 0.014, cz + sz / 2 - 0.2, cz + sz / 2 - 0.15);
  }, { floor });
}

function sloped(b: Builder, material: string, x: number, zA: number, yA: number, zB: number, yB: number, r = 0.022) {
  const len = Math.hypot(zB - zA, yB - yA);
  const rot = -Math.atan2(yB - yA, Math.abs(zB - zA)) * (zB > zA ? 1 : -1);
  b.boxC(material, [x, (yA + yB) / 2, (zA + zB) / 2], [r * 2, r * 2, len], [rot, 0, 0]);
}

export function buildFinishes(b: Builder) {
  const g = GF, f = FF;
  const fp: [number, number, number, number] = [X0 - EXT_T / 2, X1 + EXT_T / 2, Z0 - EXT_T / 2, Z1 + EXT_T / 2];
  const stairVoid: [number, number, number, number] = [STAIR.x0, STAIR.x1, STAIR.z0, STAIR.start];

  // Plaster ceilings
  b.element(stageFor("ceiling-ground-floor"), "ceiling-ground-floor", () => {
    for (const r of subtractRects(fp, [stairVoid])) b.box("plaster-interior", r[0], r[1], GF_CEIL - 0.03, GF_CEIL - 0.01, r[2], r[3]);
  }, { floor: 0, seq: 0 });
  b.element(stageFor("ceiling-first-floor"), "ceiling-first-floor", () => {
    // open over the stair, which rises into the clerestory tower
    for (const r of subtractRects(fp, [stairVoid])) b.box("plaster-interior", r[0], r[1], FF_CEIL - 0.03, FF_CEIL - 0.01, r[2], r[3]);
  }, { floor: 1, seq: 0 });

  // Recessed downlights in every room
  for (const room of ROOMS) {
    const [x0, x1, z0, z1] = room.rect;
    const ceil = room.label === "Staircase" ? FF_CEIL : room.floor === 0 ? GF_CEIL : FF_CEIL;
    if (room.floor === 1 && room.label === "Staircase") continue;
    b.element(stageFor(`downlights-${room.label.toLowerCase().replace(/\s+/g, "-")}`), `downlights-${room.label.toLowerCase().replace(/\s+/g, "-")}`, () => {
      const nx = Math.max(1, Math.round((x1 - x0 - 0.6) / 1.9));
      const nz = Math.max(1, Math.round((z1 - z0 - 0.6) / 1.9));
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / nx;
        const z = z0 + ((z1 - z0) * (j + 0.5)) / nz;
        b.cyl("light-warm", x, ceil - 0.045, ceil - 0.03, z, 0.075);
        b.cyl("metal-black", x, ceil - 0.034, ceil - 0.03, z, 0.095);
      }
    }, { floor: room.floor, seq: 1 });
  }

  // Feature pendants
  b.element(stageFor("dining-chandelier"), "dining-chandelier", () => {
    b.cyl("metal-black", 2.2, g + 2.05, GF_CEIL - 0.03, -3.9, 0.006, true);
    b.torus("metal-black", [2.2, g + 2.0, -3.9], 0.45);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.cyl("lamp-shade-linen", 2.2 + Math.sin(a) * 0.45, g + 1.95, g + 2.12, -3.9 + Math.cos(a) * 0.45, 0.07);
    }
  }, { floor: 0, seq: 2 });
  b.element(stageFor("living-tray-ceiling"), "living-tray-ceiling", () => {
    // coffered tray with a crown moulding, as in the reference living room
    const [x0, x1, z0, z1] = [2.575, 8.875, 1.575, 6.375], w = 0.55, y0 = GF_CEIL - 0.3, y1 = GF_CEIL - 0.03;
    b.box("plaster-interior", x0, x1, y0, y1, z0, z0 + w);
    b.box("plaster-interior", x0, x1, y0, y1, z1 - w, z1);
    b.box("plaster-interior", x0, x0 + w, y0, y1, z0, z1);
    b.box("plaster-interior", x1 - w, x1, y0, y1, z0, z1);
    b.box("plaster-interior", x0 + w, x1 - w, y0 - 0.05, y0, z0 + w - 0.04, z0 + w);
    b.box("plaster-interior", x0 + w, x1 - w, y0 - 0.05, y0, z1 - w, z1 - w + 0.04);
    b.box("light-warm", x0 + w + 0.05, x1 - w - 0.05, y0 + 0.02, y0 + 0.04, z0 + w + 0.02, z0 + w + 0.06);
  }, { floor: 0, seq: 2 });
  b.element(stageFor("island-pendants"), "island-pendants", () => {
    for (const x of [-6.3, -5.6, -4.9]) {
      b.cyl("metal-black", x, g + 2.1, GF_CEIL - 0.03, -4.0, 0.006, true);
      b.cyl("copper", x, g + 1.95, g + 2.15, -4.0, 0.12);
      b.cyl("light-warm", x, g + 1.93, g + 1.95, -4.0, 0.1);
    }
  }, { floor: 0, seq: 2 });
  b.element(stageFor("foyer-chandelier"), "foyer-chandelier", () => {
    b.cyl("metal-black", 0, g + 2.45, GF_CEIL - 0.03, 4.0, 0.008, true);
    b.torus("copper", [0, g + 2.45, 4.0], 0.55);
    b.torus("copper", [0, g + 2.3, 4.0], 0.4);
    b.torus("light-warm", [0, g + 2.38, 4.0], 0.47);
  }, { floor: 0, seq: 2 });
  b.element(stageFor("stair-pendant"), "stair-pendant", () => {
    b.cyl("metal-black", -1.25, f + 0.6, FF_CEIL - 0.03, -1.7, 0.006, true);
    b.sphere("light-warm", [-1.25, f + 0.45, -1.7], [0.45, 0.45, 0.45]);
  }, { floor: 1, seq: 2 });
  b.element(stageFor("upper-lounge-pendant"), "upper-lounge-pendant", () => {
    b.cyl("metal-black", -0.6, f + 2.2, FF_CEIL - 0.03, 5.0, 0.006, true);
    b.cone("copper", -0.6, f + 2.0, f + 2.3, 5.0, 0.35);
    b.cyl("light-warm", -0.6, f + 1.99, f + 2.0, 5.0, 0.3);
  }, { floor: 1, seq: 2 });
  b.element(stageFor("master-pendants"), "master-pendants", () => {
    for (const z of [3.25, 5.95]) {
      b.cyl("metal-black", 2.9, f + 1.3, FF_CEIL - 0.03, z, 0.006, true);
      b.sphere("light-warm", [2.9, f + 1.2, z], [0.22, 0.26, 0.22]);
    }
  }, { floor: 1, seq: 2 });

  // Exterior lighting on the house
  b.element(stageFor("facade-lights"), "facade-lights", () => {
    const zf = Z1 + EXT_T / 2 + 0.05;
    for (const x of [-1.05, 1.45]) {
      b.box("metal-black", x - 0.06, x + 0.06, g + 1.9, g + 2.3, zf, zf + 0.12);
      b.box("light-warm", x - 0.04, x + 0.04, g + 1.88, g + 1.9, zf + 0.02, zf + 0.1);
    }
    for (const x of [-1.2, 1.2]) b.cyl("light-warm", x, FF - 0.34, FF - 0.32, 7.6, 0.08);
    for (const x of [-6, 6]) b.cyl("light-warm", x, ROOF - 0.29, ROOF - 0.27, 6.8, 0.06);
    for (const x of [1.3, 6.4]) {
      b.box("metal-black", x - 0.06, x + 0.06, g + 2.5, g + 2.8, Z0 - EXT_T / 2 - 0.12, Z0 - EXT_T / 2);
      b.box("light-warm", x - 0.04, x + 0.04, g + 2.48, g + 2.5, Z0 - EXT_T / 2 - 0.1, Z0 - EXT_T / 2 - 0.02);
    }
  }, { floor: "site", seq: 3 });

  // Rugs
  rug(b, 0, 4.4, 3.7, 4.0, 2.8);
  rug(b, 0, 0, 4.2, 1.8, 2.6, "rug-light");
  rug(b, 0, 6.6, -0.8, 2.8, 2.6, "rug-light");
  rug(b, 0, 2.2, -3.9, 3.0, 3.0, "rug-light");
  rug(b, 0, -7.0, 4.0, 2.4, 3.0, "rug-light");
  rug(b, 1, -7.0, 4.0, 2.4, 3.0);
  rug(b, 1, -7.0, -4.0, 2.4, 3.0, "rug-light");
  rug(b, 1, 4.2, 4.6, 3.0, 3.2, "rug-light");
  rug(b, 1, -0.7, 5.0, 2.6, 2.4);
  rug(b, 1, 3.7, -3.7, 1.8, 2.2);

  // Artwork
  art(b, 0, "+z", 1.575, -0.62, g + 1.6, 0.9, 1.1, "art-rust");
  art(b, 0, "+x", 0.075, -1.85, g + 1.7, 0.75, 0.95, "suede-brown");
  art(b, 0, "+x", 0.075, -0.85, g + 1.7, 0.75, 0.95, "suede-brown");
  art(b, 0, "+z", 1.875, 4.4, g + 2.15, 1.3, 0.75, "art-blue");
  art(b, 0, "+x", -8.875, 4.0, g + 1.85, 1.2, 0.95, "art-blue");
  art(b, 1, "+x", -8.875, 4.0, f + 1.85, 1.2, 0.95, "art-rust");
  art(b, 1, "-x", -2.575, -5.2, f + 1.95, 0.75, 0.75, "suede-brown");
  art(b, 1, "-x", -2.575, -5.2, f + 1.12, 0.75, 0.75, "suede-brown");
  art(b, 0, "-z", 1.425, 5.4, g + 1.6, 1.2, 0.9, "art-ochre");
  art(b, 0, "+x", STAIR.x0 + 0.075, -0.2, g + 2.6, 1.0, 1.4, "art-ochre");
  art(b, 1, "+x", 0.075, -0.5, f + 1.6, 1.0, 0.8, "art-rust");
  art(b, 1, "+x", -2.425, 5.0, f + 1.55, 1.4, 0.8, "art-blue");
  art(b, 1, "+x", 2.575, -2.6, f + 1.6, 0.8, 0.6, "art-rust");

  // Feature walls
  b.element(stageFor("master-headboard-panelling"), "master-headboard-panelling", () => {
    panel(b, "wood-walnut", "+x", 2.575, 3.2, 6.0, f, f + 2.6, 0.025);
    for (let z = 3.3; z < 6.0; z += 0.25) panel(b, "wood-oak", "+x", 2.6, z, z + 0.01, f, f + 2.6, 0.004);
  }, { floor: 1, seq: 4 });

  // Mirrors
  mirror(b, 0, "-z", 6.375, 1.15, 2.05, g + 1.15, g + 2.0);
  mirror(b, 0, "-x", -5.575, -0.15, 0.75, g + 1.1, g + 1.95);
  mirror(b, 0, "+x", -2.425, -5.9, -5.3, g + 1.1, g + 1.9);
  mirror(b, 1, "-x", -6.075, -0.15, 0.65, f + 1.1, f + 1.95);
  mirror(b, 1, "-x", -0.075, -5.25, -4.55, f + 1.1, f + 1.9);
  mirror(b, 1, "+x", 5.075, -4.15, -2.45, f + 1.1, f + 2.0);
  mirror(b, 1, "-x", 8.875, -1.3, -0.7, f + 0.1, f + 2.0);

  // Roller blinds and ceiling fans in the bedrooms (reference bedrooms)
  const blinds: [0 | 1, number, number, number, number][] = [
    [0, -5.75, Z1 - EXT_T / 2 - 0.06, g + 2.4, 2.4], [1, -5.75, Z1 - EXT_T / 2 - 0.06, f + 2.4, 2.4],
    [1, 5.75, Z1 - EXT_T / 2 - 0.06, f + 2.4, 3.6], [1, -5.75, Z0 + EXT_T / 2 + 0.06, f + 2.6, 3.4],
  ];
  for (const [floor, x, z, y, len] of blinds) b.element(FUR, "roller-blind", () => b.group([x, y, z], () => F.rollerBlind(b, len)), { floor });
  const fans: [0 | 1, number, number, string][] = [
    [0, -5.8, 4.0, "metal-black"], [1, -5.8, 4.0, "metal-black"], [1, -5.8, -4.0, "ceramic"], [1, 5.9, 4.3, "ceramic"],
  ];
  for (const [floor, x, z, m] of fans) {
    b.element(FUR, "ceiling-fan", () => b.group([x, 0, z], () => F.ceilingFan(b, floor === 0 ? GF_CEIL - 0.03 : FF_CEIL - 0.03, m)), { floor });
  }

  // Wet-wall tiling and kitchen backsplash
  b.element(stageFor("bathroom-tiling"), "bathroom-tiling", () => {
    // guest bath
    panel(b, "floor-tile", "+x", -8.875, -1.425, 1.425, g, g + 2.2, 0.012);
    panel(b, "floor-tile", "+z", -1.425, -8.875, -5.575, g, g + 2.2, 0.012);
    // powder
    panel(b, "stone-cladding", "+z", -6.375, -2.425, -0.075, g, g + 2.2, 0.012);
    // bath 2
    panel(b, "floor-tile", "+x", -8.875, -1.425, 1.425, f, f + 2.2, 0.012);
    panel(b, "floor-tile", "+z", -1.425, -8.875, -6.075, f, f + 2.2, 0.012);
    // bath 3
    panel(b, "floor-tile", "+z", -6.375, -2.425, -0.075, f, f + 2.2, 0.012);
    panel(b, "floor-tile", "+x", -2.425, -6.375, -4.075, f, f + 2.2, 0.012);
    // master bath
    panel(b, "stone-cladding", "-x", 8.875, -6.375, -1.575, f, f + 1.3, 0.012);
    panel(b, "stone-cladding", "+z", -6.375, 5.075, 8.875, f, f + 1.25, 0.012);
    panel(b, "floor-tile", "+x", 5.075, -6.375, -1.575, f, f + 1.05, 0.012);
  }, { floor: 1, seq: 5 });
  b.element(stageFor("kitchen-backsplash"), "kitchen-backsplash", () => {
    // the rear counter runs under the kitchen glazing; splashback only at its ends
    panel(b, "quartz", "+z", -6.375, -8.875, -8.05, g + 0.92, g + 1.5, 0.012);
    panel(b, "quartz", "+z", -6.375, -3.45, -3.0, g + 0.92, g + 1.5, 0.012);
    panel(b, "quartz", "+x", -8.875, -4.75, -2.25, g + 0.92, g + 1.6, 0.012);
  }, { floor: 0, seq: 5 });

  // Stair handrails
  b.element(stageFor("stair-handrails"), "stair-handrails", () => {
    sloped(b, "copper", STAIR.x0 + 0.12, STAIR.start, g + 0.9, STAIR.landingZ, STAIR.landing + 0.9);
    sloped(b, "copper", STAIR.x1 - 0.12, STAIR.landingZ, STAIR.landing + 0.9, STAIR.start, FF + 0.9);
  }, { floor: 0, seq: 6 });

  // Warm cove strips along the pool-facade glazing and soffit downlights
  // under the roof overhang and the terrace — the evening glow in the photo.
  b.element(stageFor("glazing-cove-lights"), "glazing-cove-lights", () => {
    b.box("light-warm", 0.1, 8.9, GF_CEIL - 0.09, GF_CEIL - 0.05, Z0 + 0.14, Z0 + 0.2);
    b.box("light-warm", 0.1, 8.9, FF_CEIL - 0.09, FF_CEIL - 0.05, Z0 + 0.14, Z0 + 0.2);
    for (let x = 0.8; x < 9.4; x += 1.5) {
      b.cyl("light-warm", x, FF_CEIL - 0.06, FF_CEIL - 0.045, -8.2, 0.07);
      b.cyl("light-warm", x, FF - 0.6, FF - 0.585, -7.7, 0.07);
    }
    for (let z = 2.4; z < 6; z += 1.2) b.cyl("light-warm", 10.4, FF_CEIL - 0.06, FF_CEIL - 0.045, z, 0.07);
  }, { floor: "site", seq: 7 });

  // Point-light anchors the runtime turns into real lights (interior glow).
  const lights: [number, number, number, number][] = [
    [5.6, g + 2.6, 4.0, 1], [2.2, g + 2.5, -4.0, 1], [6.8, g + 2.6, -3.2, 1], [-5.6, g + 2.6, -4.0, 0.8],
    [0, g + 2.7, 4.0, 0.7], [5.6, f + 2.6, 4.2, 0.9], [2.8, f + 2.6, -4.2, 0.9], [7.0, f + 2.6, -4.2, 0.9],
  ];
  for (const [x, y, z, k] of lights) b.lightPoint(x, y, z, k);
}
