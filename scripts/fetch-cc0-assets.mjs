// Downloads the CC0 (public-domain) photographic textures and sky HDRI used to
// shade the villa model. Source: Poly Haven (https://polyhaven.com/license —
// CC0, no attribution required). Re-run to refresh:  npm run fetch:assets
//
// Output:
//   public/textures/<asset>/diff.jpg   (1k albedo, sRGB)
//   public/textures/<asset>/nor.jpg    (1k OpenGL normal map)
//   public/hdri/sky_1k.hdr             (lighting + reflections)
//   public/hdri/sky_4k.jpg             (tonemapped background)
//   public/textures/CREDITS.json

import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");

export const TEXTURES = [
  "white_plaster_02", "concrete_floor_01", "white_sandstone_blocks_02", "marble_01", "wood_floor",
  "large_floor_tiles_02", "stone_tiles_02", "leafy_grass", "brown_mud_leaves_01", "asphalt_02",
  "herringbone_pavement_02", "gravel", "bark_brown_02",
  "walnut_veneer", "oak_veneer_01", "fabric_pattern_07", "brown_leather", "poly_wool_herringbone",
  "long_white_tiles", "white_stucco", "painted_concrete", "large_sandstone_blocks_01",
];
const HDRI = "kloofendal_48d_partly_cloudy_puresky";

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const exists = (p) => access(p).then(() => true, () => false);

async function save(path, buf) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buf);
}

const credits = { license: "CC0 1.0 (https://polyhaven.com/license)", source: "https://polyhaven.com", assets: {} };

for (const id of TEXTURES) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const info = await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
  const albedo = files.Diffuse ?? files.col_1;
  if (!(await exists(`${ROOT}/textures/${id}/diff.webp`))) await save(`${ROOT}/textures/${id}/diff.jpg`, await get(albedo["1k"].jpg.url));
  if (!(await exists(`${ROOT}/textures/${id}/nor.webp`))) await save(`${ROOT}/textures/${id}/nor.jpg`, await get(files.nor_gl["1k"].jpg.url));
  credits.assets[id] = { name: info.name, authors: Object.keys(info.authors ?? {}), url: `https://polyhaven.com/a/${id}` };
  console.log("texture", id);
}

{
  const files = await (await fetch(`https://api.polyhaven.com/files/${HDRI}`)).json();
  const info = await (await fetch(`https://api.polyhaven.com/info/${HDRI}`)).json();
  await save(`${ROOT}/hdri/sky_1k.hdr`, await get(files.hdri["1k"].hdr.url));
  const tonemapped = files.tonemapped?.url;
  if (tonemapped) await save(`${ROOT}/hdri/sky_4k.jpg`, await get(tonemapped));
  credits.assets[HDRI] = { name: info.name, authors: Object.keys(info.authors ?? {}), url: `https://polyhaven.com/a/${HDRI}` };
  console.log("hdri", HDRI, tonemapped ? "(+ tonemapped background)" : "");
}

// Leaf atlas for foliage cards: only the jacaranda's leaf textures (the full
// scanned tree is ~215 MB and far too heavy for the web).
{
  const id = "jacaranda_tree";
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const info = await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
  await save(`${ROOT}/textures/foliage/src/leaves_diff.jpg`, await get(files.leaves_diff["1k"].jpg.url));
  await save(`${ROOT}/textures/foliage/src/leaves_alpha.jpg`, await get(files.leaves_alpha["1k"].jpg.url));
  credits.assets[`${id} (leaf textures only)`] = { name: info.name, authors: Object.keys(info.authors ?? {}), url: `https://polyhaven.com/a/${id}` };
  console.log("foliage", id);
}

await save(`${ROOT}/textures/CREDITS.json`, Buffer.from(JSON.stringify(credits, null, 2)));
