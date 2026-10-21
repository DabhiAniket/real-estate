// Downloads CC0 photoscanned furniture and plant models from Poly Haven and
// converts each to a web-ready GLB (meshopt geometry, WebP textures):
//   public/models/props/<id>.glb       (1024 px textures)
//   public/models/props/<id>-512.glb   (512 px textures, phones)
// Credits are merged into public/textures/CREDITS.json.
//   npm run fetch:props

import { execFileSync } from "node:child_process";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = resolve(ROOT, ".cache/props");
const OUT = resolve(ROOT, "public/models/props");

export const PROPS = [
  "sofa_02", "sofa_03", "ArmChair_01", "modern_arm_chair_01", "mid_century_lounge_chair",
  "modern_coffee_table_01", "side_table_01", "round_wooden_table_01", "dining_chair_02",
  "Ottoman_01", "shrub_02",
];

const exists = (p) => access(p).then(() => true, () => false);
async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const credits = JSON.parse(await readFile(resolve(ROOT, "public/textures/CREDITS.json"), "utf8"));
await mkdir(OUT, { recursive: true });
const cli = resolve(ROOT, "node_modules/.bin/gltf-transform");

for (const id of PROPS) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const info = await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
  const g = files.gltf["1k"].gltf;
  const dir = resolve(CACHE, id);
  const main = resolve(dir, `${id}.gltf`);
  if (!(await exists(main))) {
    await mkdir(dir, { recursive: true });
    await writeFile(main, await get(g.url));
    for (const [rel, f] of Object.entries(g.include ?? {})) {
      const p = resolve(dir, rel);
      await mkdir(dirname(p), { recursive: true });
      await writeFile(p, await get(f.url));
    }
  }
  for (const [size, suffix] of [[1024, ""], [512, "-512"]]) {
    execFileSync(cli, [
      "optimize", main, resolve(OUT, `${id}${suffix}.glb`),
      "--compress", "meshopt", "--texture-compress", "webp", "--texture-size", String(size),
      "--simplify", "false", "--instance", "false", "--join", "false", "--palette", "false",
    ], { stdio: "ignore" });
  }
  credits.assets[`${id} (model)`] = { name: info.name, authors: Object.keys(info.authors ?? {}), url: `https://polyhaven.com/a/${id}` };
  console.log("prop", id);
}
await writeFile(resolve(ROOT, "public/textures/CREDITS.json"), JSON.stringify(credits, null, 2));
