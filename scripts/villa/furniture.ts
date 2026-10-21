// Parametric furniture and fixtures. Each function authors geometry in a local
// frame: origin on the floor at the footprint centre, front facing +z, back
// against −z. Callers place them with Builder.item(at, rotY).

import type { Builder } from "./kit.ts";

export function sofa(b: Builder, len: number, fabric = "fabric-linen", depth = 0.95) {
  const d2 = depth / 2, l2 = len / 2;
  b.box("wood-walnut", -l2 + 0.05, l2 - 0.05, 0, 0.1, -d2 + 0.05, d2 - 0.05);
  b.box(fabric, -l2, l2, 0.1, 0.4, -d2, d2);
  b.box(fabric, -l2, l2, 0.4, 0.82, -d2, -d2 + 0.22);
  b.box(fabric, -l2, -l2 + 0.18, 0.4, 0.62, -d2, d2);
  b.box(fabric, l2 - 0.18, l2, 0.4, 0.62, -d2, d2);
  const n = Math.max(2, Math.round((len - 0.36) / 0.8));
  const cw = (len - 0.36) / n;
  for (let i = 0; i < n; i++) {
    const x0 = -l2 + 0.18 + i * cw;
    b.box(fabric, x0 + 0.01, x0 + cw - 0.01, 0.4, 0.5, -d2 + 0.22, d2 - 0.02);
    b.box(fabric, x0 + 0.03, x0 + cw - 0.03, 0.5, 0.78, -d2 + 0.2, -d2 + 0.36);
  }
  b.box("fabric-terracotta", -l2 + 0.25, -l2 + 0.65, 0.5, 0.82, -d2 + 0.36, -d2 + 0.48);
  b.box("fabric-sage", l2 - 0.65, l2 - 0.25, 0.5, 0.82, -d2 + 0.36, -d2 + 0.48);
}

export function armchair(b: Builder, fabric = "fabric-charcoal") {
  b.box("wood-walnut", -0.36, -0.32, 0, 0.12, -0.36, 0.36);
  b.box("wood-walnut", 0.32, 0.36, 0, 0.12, -0.36, 0.36);
  b.box(fabric, -0.4, 0.4, 0.12, 0.42, -0.4, 0.4);
  b.box(fabric, -0.4, 0.4, 0.42, 0.85, -0.4, -0.22);
  b.box(fabric, -0.4, -0.3, 0.42, 0.62, -0.4, 0.4);
  b.box(fabric, 0.3, 0.4, 0.42, 0.62, -0.4, 0.4);
  b.box(fabric, -0.3, 0.3, 0.42, 0.5, -0.22, 0.38);
}

export function coffeeTable(b: Builder, w: number, d: number, top = "quartz") {
  b.box("wood-walnut", -w / 2 + 0.1, w / 2 - 0.1, 0, 0.3, -d / 2 + 0.1, d / 2 - 0.1);
  b.box(top, -w / 2, w / 2, 0.3, 0.38, -d / 2, d / 2);
  b.box("book", -0.25, 0.05, 0.38, 0.42, -0.1, 0.12);
  b.sphere("ceramic", [0.25, 0.45, 0], [0.16, 0.14, 0.16]);
}

export function sideTable(b: Builder) {
  b.cyl("metal-black", 0, 0, 0.5, 0, 0.03);
  b.cyl("metal-black", 0, 0, 0.02, 0, 0.18);
  b.cyl("wood-oak", 0, 0.5, 0.54, 0, 0.24);
}

export function floorLamp(b: Builder) {
  b.cyl("metal-black", 0, 0, 0.03, 0, 0.16);
  b.cyl("metal-black", 0, 0.03, 1.45, 0, 0.012, true);
  b.cyl("light-warm", 0, 1.35, 1.65, 0, 0.2);
}

export function tvUnit(b: Builder, w: number, withTv = true) {
  b.box("wood-walnut", -w / 2, w / 2, 0.08, 0.5, -0.225, 0.225);
  b.box("metal-black", -w / 2 + 0.05, w / 2 - 0.05, 0, 0.08, -0.2, 0.2);
  for (let i = 1; i < 4; i++) {
    const x = -w / 2 + (w * i) / 4;
    b.box("granite-black", x - 0.004, x + 0.004, 0.1, 0.48, 0.225, 0.229);
  }
  if (withTv) {
    b.box("screen-black", -0.82, 0.82, 1.0, 1.95, -0.22, -0.18);
    b.box("metal-black", -0.84, 0.84, 0.98, 1.97, -0.225, -0.215);
  }
  b.box("book-alt", w / 2 - 0.5, w / 2 - 0.2, 0.5, 0.56, -0.1, 0.1);
}

export function consoleTable(b: Builder, w: number, d = 0.4) {
  b.box("wood-walnut", -w / 2, w / 2, 0.74, 0.8, -d / 2, d / 2);
  b.box("metal-black", -w / 2 + 0.03, -w / 2 + 0.06, 0, 0.74, -d / 2 + 0.03, d / 2 - 0.03);
  b.box("metal-black", w / 2 - 0.06, w / 2 - 0.03, 0, 0.74, -d / 2 + 0.03, d / 2 - 0.03);
  b.box("wood-walnut", -w / 2 + 0.06, w / 2 - 0.06, 0.15, 0.18, -d / 2 + 0.03, d / 2 - 0.03);
  b.cyl("terracotta", -w / 4, 0.8, 1.1, 0, 0.09);
  b.blob("leaf", [-w / 4, 1.2, 0], [0.25, 0.22, 0.25]);
  b.box("book", w / 6, w / 6 + 0.25, 0.8, 0.86, -0.1, 0.1);
}

export function sideboard(b: Builder, w: number) {
  b.box("wood-oak", -w / 2, w / 2, 0.12, 0.8, -0.225, 0.225);
  b.box("metal-black", -w / 2 + 0.05, w / 2 - 0.05, 0, 0.12, -0.18, 0.18);
  for (let i = 1; i < 3; i++) {
    const x = -w / 2 + (w * i) / 3;
    b.box("wood-walnut", x - 0.005, x + 0.005, 0.14, 0.78, 0.225, 0.23);
  }
  b.cyl("ceramic", -w / 3, 0.8, 1.1, 0, 0.08);
  b.cyl("ceramic", -w / 3 + 0.2, 0.8, 1.0, 0.02, 0.06);
}

export function diningChair(b: Builder, fabric = "fabric-linen") {
  for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]] as const) {
    b.box("wood-walnut", x - 0.02, x + 0.02, 0, 0.45, z - 0.02, z + 0.02);
  }
  b.box(fabric, -0.22, 0.22, 0.45, 0.52, -0.22, 0.22);
  b.box("wood-walnut", -0.22, 0.22, 0.52, 0.92, -0.24, -0.2);
}

export function barStool(b: Builder) {
  b.cyl("metal-black", 0, 0, 0.03, 0, 0.18);
  b.cyl("metal-black", 0, 0.03, 0.7, 0, 0.025, true);
  b.torus("metal-black", [0, 0.32, 0], 0.16);
  b.cyl("leather", 0, 0.7, 0.76, 0, 0.19);
}

export function bed(b: Builder, w: number, l: number, fabric = "fabric-linen", headboard = "fabric-linen", headH = 1.15, throwMat = "fabric-terracotta") {
  const w2 = w / 2, l2 = l / 2;
  b.box("wood-walnut", -w2, w2, 0.05, 0.32, -l2 + 0.08, l2);
  b.box("metal-black", -w2 + 0.1, w2 - 0.1, 0, 0.05, -l2 + 0.2, l2 - 0.1);
  b.box("bedding", -w2 + 0.04, w2 - 0.04, 0.32, 0.56, -l2 + 0.1, l2 - 0.04);
  b.box(fabric, -w2 + 0.02, w2 - 0.02, 0.5, 0.6, -l2 + 0.75, l2 - 0.02);
  b.box(fabric, -w2 - 0.01, w2 + 0.01, 0.22, 0.6, l2 - 0.04, l2 + 0.01);
  b.box(throwMat, -w2 + 0.02, w2 - 0.02, 0.6, 0.62, l2 - 0.62, l2 - 0.15);
  const pw = (w - 0.2) / 2;
  b.boxC("bedding", [-pw / 2 - 0.03, 0.66, -l2 + 0.32], [pw, 0.16, 0.38], [-0.3, 0, 0]);
  b.boxC("bedding", [pw / 2 + 0.03, 0.66, -l2 + 0.32], [pw, 0.16, 0.38], [-0.3, 0, 0]);
  b.box(headboard, -w2 - 0.12, w2 + 0.12, 0.05, headH, -l2, -l2 + 0.09);
}

export function wardrobe(b: Builder, w: number, h = 2.4, d = 0.6, finish = "cabinet-linen") {
  b.box(finish, -w / 2, w / 2, 0.08, h, -d / 2, d / 2);
  b.box("metal-black", -w / 2 + 0.02, w / 2 - 0.02, 0, 0.08, -d / 2 + 0.02, d / 2 - 0.05);
  const n = Math.max(2, Math.round(w / 0.55));
  for (let i = 0; i <= n; i++) {
    const x = -w / 2 + (w * i) / n;
    if (i > 0 && i < n) b.box("wood-walnut", x - 0.004, x + 0.004, 0.1, h - 0.02, d / 2, d / 2 + 0.004);
    if (i < n) {
      const hx = x + (i % 2 === 0 ? w / n - 0.06 : 0.06);
      b.box("copper", hx - 0.01, hx + 0.01, 0.95, 1.45, d / 2, d / 2 + 0.03);
    }
  }
}

export function desk(b: Builder, w: number, d = 0.65) {
  b.box("wood-oak", -w / 2, w / 2, 0.72, 0.76, -d / 2, d / 2);
  b.box("metal-black", -w / 2 + 0.03, -w / 2 + 0.06, 0, 0.72, -d / 2 + 0.03, d / 2 - 0.03);
  b.box("metal-black", w / 2 - 0.06, w / 2 - 0.03, 0, 0.72, -d / 2 + 0.03, d / 2 - 0.03);
  b.box("wood-oak", w / 2 - 0.5, w / 2 - 0.08, 0.5, 0.72, -d / 2 + 0.03, d / 2 - 0.05);
  b.box("screen-black", -0.3, 0.3, 1.0, 1.35, -d / 2 + 0.12, -d / 2 + 0.15);
  b.box("metal-steel", -0.03, 0.03, 0.76, 1.0, -d / 2 + 0.1, -d / 2 + 0.13);
  b.box("metal-steel", -0.2, 0.2, 0.76, 0.78, -0.05, 0.12);
  b.cyl("metal-black", -w / 2 + 0.2, 0.76, 1.15, -d / 2 + 0.15, 0.012, true);
  b.cyl("light-warm", -w / 2 + 0.2, 1.1, 1.2, -d / 2 + 0.15, 0.08);
}

export function officeChair(b: Builder) {
  b.cyl("metal-black", 0, 0, 0.06, 0, 0.3);
  b.cyl("metal-black", 0, 0.06, 0.45, 0, 0.03, true);
  b.box("fabric-charcoal", -0.24, 0.24, 0.45, 0.53, -0.24, 0.24);
  b.box("fabric-charcoal", -0.22, 0.22, 0.6, 1.05, -0.28, -0.22);
}

export function bookshelf(b: Builder, w: number, h: number, d = 0.35) {
  b.box("wood-oak", -w / 2, w / 2, 0, h, -d / 2, -d / 2 + 0.02);
  b.box("wood-oak", -w / 2, -w / 2 + 0.03, 0, h, -d / 2, d / 2);
  b.box("wood-oak", w / 2 - 0.03, w / 2, 0, h, -d / 2, d / 2);
  const shelves = Math.round(h / 0.38);
  for (let i = 0; i <= shelves; i++) {
    const y = (h * i) / shelves;
    b.box("wood-oak", -w / 2, w / 2, Math.max(0, y - 0.03), y, -d / 2, d / 2);
    if (i < shelves) {
      let x = -w / 2 + 0.06;
      let k = 0;
      while (x < w / 2 - 0.25) {
        const bw = 0.03 + ((k * 37) % 5) * 0.008;
        const bh = 0.22 + ((k * 13) % 4) * 0.025;
        const run = 6 + (k % 5);
        if (k % 7 === 3) {
          b.cyl("ceramic", x + 0.08, y, y + 0.18, 0, 0.06);
          x += 0.22;
        } else {
          for (let j = 0; j < run && x < w / 2 - 0.1; j++) {
            b.box(j % 3 === 0 ? "book-alt" : j % 3 === 1 ? "book" : "art-ochre", x, x + bw, y, y + bh, -d / 2 + 0.04, d / 2 - 0.05);
            x += bw + 0.004;
          }
          x += 0.12;
        }
        k++;
      }
    }
  }
}

export function plant(b: Builder, size = 1) {
  b.cyl("terracotta", 0, 0, 0.42 * size, 0, 0.22 * size);
  b.cyl("soil", 0, 0.42 * size - 0.02, 0.42 * size, 0, 0.2 * size);
  b.cyl("bark", 0, 0.4 * size, 1.0 * size, 0, 0.02 * size, true);
  canopy(b, 0, 1.05 * size, 0, 0.42 * size, 0.5 * size, 0.42 * size, 9, Math.round(size * 100));
}

export function bench(b: Builder, w: number, d = 0.42, fabric = "fabric-sage") {
  b.box("wood-walnut", -w / 2 + 0.05, -w / 2 + 0.09, 0, 0.4, -d / 2 + 0.04, d / 2 - 0.04);
  b.box("wood-walnut", w / 2 - 0.09, w / 2 - 0.05, 0, 0.4, -d / 2 + 0.04, d / 2 - 0.04);
  b.box(fabric, -w / 2, w / 2, 0.4, 0.48, -d / 2, d / 2);
}

export function ottoman(b: Builder, w: number, d: number, fabric = "leather") {
  b.box(fabric, -w / 2, w / 2, 0.05, 0.44, -d / 2, d / 2);
  b.box("metal-black", -w / 2 + 0.04, w / 2 - 0.04, 0, 0.05, -d / 2 + 0.04, d / 2 - 0.04);
}

// ---- kitchen

export function baseRun(b: Builder, len: number, opts: { sinkAt?: number; hobAt?: number; finish?: string } = {}) {
  const finish = opts.finish ?? "cabinet-sage";
  const l2 = len / 2;
  b.box("metal-black", -l2, l2, 0, 0.1, -0.3, 0.24);
  b.box(finish, -l2, l2, 0.1, 0.88, -0.3, 0.28);
  const n = Math.max(1, Math.round(len / 0.6));
  for (let i = 1; i < n; i++) {
    const x = -l2 + (len * i) / n;
    b.box("granite-black", x - 0.004, x + 0.004, 0.12, 0.86, 0.28, 0.284);
  }
  b.box("granite-black", -l2, l2, 0.62, 0.628, 0.28, 0.284);
  for (let i = 0; i < n; i++) {
    const x = -l2 + (len * (i + 0.5)) / n;
    b.box("copper", x - 0.12, x + 0.12, 0.82, 0.835, 0.28, 0.3);
  }
  b.box("quartz", -l2, l2, 0.88, 0.92, -0.3, 0.3);
  if (opts.sinkAt !== undefined) {
    const s = opts.sinkAt;
    b.box("metal-steel", s - 0.38, s + 0.38, 0.75, 0.921, -0.18, 0.2);
    b.box("granite-black", s - 0.35, s + 0.35, 0.76, 0.922, -0.15, 0.17);
    b.cyl("chrome", s, 0.92, 1.25, -0.24, 0.018, true);
    b.boxC("chrome", [s, 1.24, -0.12], [0.03, 0.03, 0.26]);
  }
  if (opts.hobAt !== undefined) {
    const h = opts.hobAt;
    b.box("granite-black", h - 0.38, h + 0.38, 0.92, 0.93, -0.25, 0.25);
    for (const [dx, dz] of [[-0.2, -0.12], [0.2, -0.12], [-0.2, 0.12], [0.2, 0.12]] as const) {
      b.torus("metal-steel", [h + dx, 0.935, dz], 0.08);
    }
    b.box("appliance-steel", h - 0.3, h + 0.3, 0.15, 0.7, 0.28, 0.3);
    b.box("screen-black", h - 0.25, h + 0.25, 0.25, 0.6, 0.3, 0.305);
  }
}

export function tallUnits(b: Builder, len: number) {
  // fridge (left) + pantry + oven tower
  const l2 = len / 2;
  b.box("appliance-steel", -l2, -l2 + 0.9, 0, 2.1, -0.32, 0.3);
  b.box("metal-black", -l2 + 0.448, -l2 + 0.452, 0.05, 2.08, 0.3, 0.305);
  b.box("chrome", -l2 + 0.4, -l2 + 0.42, 0.8, 1.5, 0.3, 0.34);
  b.box("chrome", -l2 + 0.48, -l2 + 0.5, 0.8, 1.5, 0.3, 0.34);
  b.box("cabinet-sage", -l2 + 0.9, l2, 0.1, 2.4, -0.32, 0.3);
  b.box("cabinet-sage", -l2, -l2 + 0.9, 2.1, 2.4, -0.32, 0.3);
  b.box("metal-black", -l2 + 0.9, l2, 0, 0.1, -0.3, 0.26);
  b.box("appliance-steel", l2 - 0.62, l2 - 0.02, 0.9, 1.5, 0.3, 0.31);
  b.box("screen-black", l2 - 0.58, l2 - 0.06, 0.95, 1.4, 0.31, 0.315);
  b.box("appliance-steel", l2 - 0.62, l2 - 0.02, 1.52, 1.9, 0.3, 0.31);
  for (const x of [-l2 + 1.2, -l2 + 1.7]) b.box("copper", x - 0.01, x + 0.01, 0.9, 1.6, 0.3, 0.33);
}

export function hood(b: Builder) {
  b.box("appliance-steel", -0.45, 0.45, 1.6, 1.75, -0.25, 0.25);
  b.box("appliance-steel", -0.15, 0.15, 1.75, 2.6, -0.25, 0.05);
  b.box("light-warm", -0.35, 0.35, 1.595, 1.6, -0.15, 0.15);
}

export function island(b: Builder, w: number, d: number) {
  b.box("cabinet-charcoal", -w / 2 + 0.06, w / 2 - 0.06, 0, 0.88, -d / 2, d / 2 - 0.3);
  b.box("quartz", -w / 2, w / 2, 0.88, 0.93, -d / 2, d / 2);
  b.box("quartz", -w / 2, -w / 2 + 0.06, 0, 0.88, -d / 2, d / 2);
  b.box("quartz", w / 2 - 0.06, w / 2, 0, 0.88, -d / 2, d / 2);
  b.sphere("ceramic", [-0.4, 1.0, -0.1], [0.3, 0.12, 0.3]);
  for (const [x, m] of [[-0.45, "flower"], [-0.33, "leaf-light"], [-0.5, "art-ochre"]] as const) b.sphere(m, [x, 1.05, -0.1 + (x + 0.4) * 0.5], [0.08, 0.08, 0.08]);
  b.box("wood-walnut", 0.2, 0.6, 0.93, 0.95, -0.25, 0.05);
}

// ---- bathrooms

export function vanity(b: Builder, w: number, basins = 1) {
  b.box("wood-walnut", -w / 2, w / 2, 0.3, 0.82, -0.25, 0.25);
  b.box("quartz", -w / 2, w / 2, 0.82, 0.86, -0.25, 0.27);
  for (let i = 0; i < basins; i++) {
    const x = -w / 2 + (w * (i + 0.5)) / basins;
    b.box("ceramic", x - 0.24, x + 0.24, 0.86, 0.98, -0.12, 0.2);
    b.box("granite-black", x - 0.2, x + 0.2, 0.9, 0.981, -0.08, 0.16);
    b.cyl("chrome", x, 0.86, 1.1, -0.2, 0.015, true);
    b.boxC("chrome", [x, 1.09, -0.12], [0.025, 0.025, 0.16]);
  }
  b.box("copper", -w / 2 + 0.1, w / 2 - 0.1, 0.7, 0.71, 0.25, 0.27);
}

export function wc(b: Builder) {
  b.box("ceramic", -0.2, 0.2, 0.3, 0.75, -0.325, -0.15);
  b.box("ceramic", -0.18, 0.18, 0, 0.4, -0.15, 0.25);
  b.box("ceramic", -0.19, 0.19, 0.4, 0.43, -0.15, 0.3);
  b.box("chrome", -0.08, 0.08, 0.72, 0.76, -0.25, -0.2);
}

export function bathtub(b: Builder, w: number, d: number) {
  b.box("ceramic", -w / 2, w / 2, 0, 0.58, -d / 2, d / 2);
  b.box("water", -w / 2 + 0.07, w / 2 - 0.07, 0.4, 0.581, -d / 2 + 0.07, d / 2 - 0.07);
  b.cyl("chrome", w / 2 + 0.12, 0, 0.95, 0, 0.02, true);
  b.boxC("chrome", [w / 2 + 0.05, 0.93, 0], [0.16, 0.03, 0.03]);
}

/** Shower tray, glass screens and rain head. Screens collide; the tray doesn't. */
export function showerFixtures(b: Builder, w: number, d: number) {
  b.box("floor-stone", -w / 2, w / 2, 0, 0.04, -d / 2, d / 2);
  b.box("granite-black", -0.25, 0.25, 0.041, 0.045, -0.03, 0.03);
  b.cyl("chrome", 0, 2.05, 2.08, -d / 2 + 0.35, 0.15);
  b.box("chrome", -0.015, 0.015, 2.06, 2.09, -d / 2, -d / 2 + 0.35);
  b.box("chrome", -0.04, 0.04, 1.0, 1.2, -d / 2, -d / 2 + 0.05);
}

// ---- utility

export function washer(b: Builder, dryer = false) {
  b.box("ceramic", -0.3, 0.3, 0, 0.85, -0.3, 0.3);
  b.cylAxis("metal-black", [0, 0.45, 0.3], 0.2, 0.02, "z");
  b.cylAxis(dryer ? "metal-steel" : "glass-frosted", [0, 0.45, 0.31], 0.15, 0.01, "z");
  b.box("metal-steel", -0.25, 0.25, 0.74, 0.8, 0.3, 0.305);
}

// ---- outdoor

export function lounger(b: Builder) {
  b.box("metal-steel", -0.33, -0.3, 0, 0.3, -0.9, 0.9);
  b.box("metal-steel", 0.3, 0.33, 0, 0.3, -0.9, 0.9);
  b.box("fabric-linen", -0.32, 0.32, 0.3, 0.38, -0.3, 0.95);
  b.boxC("fabric-linen", [0, 0.58, -0.62], [0.64, 0.08, 0.66], [0.75, 0, 0]);
  b.box("bedding", -0.15, 0.15, 0.38, 0.4, 0.3, 0.7);
}

export function outdoorChair(b: Builder) {
  b.box("wood-oak", -0.3, 0.3, 0, 0.4, -0.3, 0.3);
  b.box("fabric-linen", -0.28, 0.28, 0.4, 0.48, -0.28, 0.3);
  b.box("wood-oak", -0.3, 0.3, 0.4, 0.82, -0.32, -0.26);
}

export function outdoorTable(b: Builder, w: number, d: number) {
  b.box("wood-oak", -w / 2, w / 2, 0.71, 0.75, -d / 2, d / 2);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    b.box("metal-black", x * (w / 2 - 0.08) - 0.03, x * (w / 2 - 0.08) + 0.03, 0, 0.71, z * (d / 2 - 0.08) - 0.03, z * (d / 2 - 0.08) + 0.03);
  }
}

function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Leaf mass: a dark inner core for density plus many alpha-tested leaf cards
 * (CC0 photographed leaf atlas) scattered over the crown's outer shell, so the
 * silhouette and light read as real foliage rather than solid blobs.
 */
export function canopy(b: Builder, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, clumps: number, seed: number, tint = "leaf-card") {
  const r = rng(seed);
  b.blob("leaf-dark", [cx, cy, cz], [rx * 1.05, ry * 1.0, rz * 1.05], seed);
  const cards = Math.round(clumps * 4.5);
  for (let i = 0; i < cards; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, rad = 0.62 + 0.42 * Math.sqrt(r());
    const sx = Math.sqrt(1 - u * u) * Math.cos(th), sz = Math.sqrt(1 - u * u) * Math.sin(th);
    const size = (0.55 + r() * 0.5) * Math.max(0.55, Math.min(rx, rz) * 0.42);
    b.card(
      r() < 0.3 ? "leaf-card-dark" : tint,
      [cx + sx * rx * rad, cy + u * ry * rad * 0.9, cz + sz * rz * rad],
      size,
      size,
      [(r() - 0.5) * 1.6, th + (r() - 0.5) * 1.2, (r() - 0.5) * 1.6],
    );
  }
}

export function palm(b: Builder, h: number) {
  for (let i = 0; i < 6; i++) {
    const y0 = (h * i) / 6, y1 = (h * (i + 1)) / 6;
    b.cyl("bark", Math.sin(i * 0.5) * 0.05, y0, y1 + 0.02, 0, 0.17 - i * 0.01, true);
  }
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
    const droop = 0.35 + (i % 3) * 0.25;
    // frond: a long card hinged at the crown, leaning out and down
    b.card("leaf-card", [Math.sin(a) * 1.0, h - 0.1 - droop * 0.35, Math.cos(a) * 1.0], 1.0, 2.3, [-Math.PI / 2 + droop, a, 0]);
  }
  b.blob("leaf-dark", [0, h - 0.05, 0], [0.5, 0.4, 0.5]);
}

export function car(b: Builder) {
  // a sedan parked nose-first (+z)
  b.box("car-paint", -0.9, 0.9, 0.3, 0.85, -2.3, 2.3);
  b.box("car-paint", -0.82, 0.82, 0.85, 1.35, -1.2, 0.9);
  b.box("glass", -0.8, 0.8, 0.88, 1.32, 0.9, 1.25);
  b.box("glass", -0.8, 0.8, 0.88, 1.3, -1.5, -1.2);
  b.box("glass", -0.83, 0.83, 0.9, 1.3, -1.15, 0.85);
  b.box("light-cool", -0.8, -0.5, 0.6, 0.7, 2.3, 2.31);
  b.box("light-cool", 0.5, 0.8, 0.6, 0.7, 2.3, 2.31);
  b.box("art-rust", -0.85, -0.5, 0.65, 0.72, -2.31, -2.3);
  b.box("art-rust", 0.5, 0.85, 0.65, 0.72, -2.31, -2.3);
  for (const x of [-0.85, 0.85]) for (const z of [-1.45, 1.45]) {
    b.cylAxis("tyre", [x, 0.33, z], 0.33, 0.24, "x");
    b.cylAxis("metal-steel", [x + Math.sign(x) * 0.12, 0.33, z], 0.2, 0.02, "x");
  }
}

// ---- Mediterranean planting (reference: hero_villa_sunset.jpg)

export function agave(b: Builder, size = 1, seed = 1) {
  const r = rng(seed);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.4;
    const tilt = 0.45 + r() * 0.65;
    const len = size * (0.55 + r() * 0.35);
    // leaf rises from the centre and leans outward
    const cx = Math.sin(a) * Math.sin(tilt) * len * 0.5, cz = Math.cos(a) * Math.sin(tilt) * len * 0.5;
    b.boxC("agave", [cx, Math.cos(tilt) * len * 0.5, cz], [size * 0.1, len, size * 0.025], [Math.cos(a) * tilt, a, 0]);
  }
}

export function grassClump(b: Builder, h = 0.9, seed = 1) {
  const r = rng(seed);
  for (let i = 0; i < 18; i++) {
    const a = r() * Math.PI * 2, tilt = 0.1 + r() * 0.45, len = h * (0.6 + r() * 0.45);
    b.boxC(i % 4 ? "grass-blade" : "leaf-olive", [Math.sin(a) * Math.sin(tilt) * len * 0.5, Math.cos(tilt) * len * 0.5, Math.cos(a) * Math.sin(tilt) * len * 0.5], [0.025, len, 0.012], [Math.cos(a) * tilt, a, 0]);
  }
  b.blob("leaf-olive", [0, h * 0.18, 0], [h * 0.5, h * 0.35, h * 0.5]);
}

/** Olive: short twisted trunk, wide silver-green crown. */
export function oliveTree(b: Builder, h = 4.5, seed = 3) {
  const r = rng(seed);
  b.boxC("bark", [0.05, h * 0.18, 0], [0.32, h * 0.36, 0.28], [0.1, 0.3, 0.12]);
  b.boxC("bark", [-0.1, h * 0.42, 0.08], [0.22, h * 0.32, 0.2], [-0.25, 0.8, -0.1]);
  b.boxC("bark", [0.3, h * 0.45, -0.1], [0.16, h * 0.3, 0.16], [0.2, -0.6, 0.4]);
  canopy(b, 0, h * 0.72, 0, h * 0.42, h * 0.27, h * 0.4, 44, Math.floor(r() * 1000), "leaf-card-olive");
}

/** Stone pine: tall bare trunk, flat umbrella crown. */
export function pineTree(b: Builder, h = 9, seed = 5) {
  const r = rng(seed);
  const lean = (r() - 0.5) * 0.12;
  b.boxC("bark", [lean * h * 0.4, h * 0.36, 0], [0.32, h * 0.72, 0.32], [0, 0, lean]);
  for (let i = 0; i < 3; i++) {
    const a = r() * Math.PI * 2;
    b.boxC("bark", [Math.sin(a) * 0.7, h * 0.74, Math.cos(a) * 0.7], [0.12, 1.8, 0.12], [Math.cos(a) * 0.8, a, 0]);
  }
  canopy(b, lean * h * 0.7, h * 0.86, 0, h * 0.32, h * 0.12, h * 0.3, 52, Math.floor(r() * 1000), "leaf-card-dark");
}

// ---- pieces from the reference interiors (public/images/reference/*)

/** Living-room fireplace: stone surround, white mantel, chimney breast. */
export function fireplace(b: Builder, ceil: number) {
  b.box("plaster-interior", -1.0, 1.0, 0, ceil, -0.3, 0.0);
  b.box("travertine", -0.95, 0.95, 0, 1.15, 0.0, 0.08);
  b.box("fire-box", -0.48, 0.48, 0.12, 0.72, 0.0, 0.085);
  b.box("metal-steel", -0.5, 0.5, 0.1, 0.74, 0.08, 0.09);
  b.blob("fire-glow", [0, 0.24, 0.03], [0.6, 0.18, 0.08]);
  for (const x of [-0.25, 0, 0.22]) b.boxC("wood-walnut", [x, 0.18, 0.04], [0.32, 0.06, 0.06], [0, 0, x * 0.6]);
  b.box("plaster-interior", -1.1, 1.1, 1.15, 1.25, -0.02, 0.18);
  b.box("travertine", -1.2, 1.2, -0.02, 0.0, -0.05, 0.45);
  for (const x of [-0.8, -0.65]) {
    b.cyl("ceramic", x, 1.25, x === -0.8 ? 1.55 : 1.45, 0.06, 0.04);
    b.cyl("art-blue", x, x === -0.8 ? 1.55 : 1.45, x === -0.8 ? 1.68 : 1.58, 0.06, 0.035);
  }
}

export function ceilingFan(b: Builder, ceil: number, blades = "metal-black") {
  b.cyl(blades, 0, ceil - 0.08, ceil, 0, 0.07);
  b.cyl(blades, 0, ceil - 0.3, ceil - 0.08, 0, 0.012, true);
  b.cyl(blades, 0, ceil - 0.42, ceil - 0.3, 0, 0.16);
  b.cyl("light-warm", 0, ceil - 0.44, ceil - 0.42, 0, 0.12);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.3;
    b.boxC(blades, [Math.sin(a) * 0.55, ceil - 0.36, Math.cos(a) * 0.55], [0.15, 0.012, 0.75], [0.12, a, 0]);
  }
}

/** Nightstand variants from the reference bedrooms. */
export function nightstandStyled(b: Builder, style: "black-peg" | "gold-ring", lamp: "ceramic-linen" | "black-shade") {
  let top = 0.55;
  if (style === "black-peg") {
    b.box("cabinet-charcoal", -0.25, 0.25, 0.38, 0.55, -0.2, 0.2);
    for (const [x, z] of [[-0.21, -0.16], [0.21, -0.16], [-0.21, 0.16], [0.21, 0.16]] as const) b.cyl("metal-black", x, 0, 0.38, z, 0.012, true);
  } else {
    top = 0.6;
    b.cyl("glass", 0, top - 0.015, top, 0, 0.27);
    for (let i = 0; i < 6; i++) b.torus("gold", [0, 0.15 + (i % 2) * 0.25, 0], 0.26, [0, (i / 6) * Math.PI, 0]);
    b.torus("gold", [0, top - 0.02, 0], 0.27);
  }
  if (lamp === "ceramic-linen") {
    b.cyl("terracotta", 0, top, top + 0.25, 0, 0.06);
    b.cyl("lamp-shade-linen", 0, top + 0.25, top + 0.45, 0, 0.13);
  } else {
    b.cyl("glass", 0, top, top + 0.32, 0, 0.09);
    b.cyl("gold", 0, top + 0.32, top + 0.4, 0, 0.015, true);
    b.cone("lamp-shade-black", 0, top + 0.38, top + 0.62, 0, 0.2);
  }
}

/** Upholstered bench chair with brass legs (reference bedroom). */
export function benchChair(b: Builder) {
  for (const x of [-0.3, 0.3]) {
    b.box("gold", x - 0.012, x + 0.012, 0, 0.42, -0.25, -0.23);
    b.box("gold", x - 0.012, x + 0.012, 0, 0.42, 0.23, 0.25);
  }
  b.box("fabric-grey", -0.34, 0.34, 0.42, 0.5, -0.28, 0.28);
  b.box("fabric-grey", -0.34, 0.34, 0.5, 0.92, -0.3, -0.22);
  b.box("velvet-teal", -0.2, 0.2, 0.5, 0.88, -0.22, -0.1);
}

export function rollerBlind(b: Builder, len: number) {
  b.box("metal-steel", -len / 2 - 0.05, len / 2 + 0.05, -0.1, 0, -0.05, 0.05);
  b.box("curtain", -len / 2, len / 2, -0.55, -0.1, -0.01, 0.01);
}
