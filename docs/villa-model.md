# The villa model

One model drives the hero, the scroll assembly and the first-person walkthrough:
`public/models/villa.glb`. It is generated from code (`scripts/villa/*`) and
dressed at runtime with CC0 photographic textures, a CC0 sky and CC0
photoscanned furniture and plants.

## What it contains

| | |
|---|---|
| Building | Two floors, 18 m × 13 m footprint, 468 m² |
| Ground floor | Foyer, living room (fireplace, tray ceiling), dining, family lounge, kitchen, utility, powder room, guest bedroom + bath, stair |
| First floor | Upper lounge, master bedroom + dressing + bath, study, bedrooms 2 and 3, bath 2, bath 3, bedroom-3 dressing, corridor and passage |
| Outdoors | Front balcony, master balcony, bedroom-3 balcony, pool terrace, porcelain deck, infinity pool, lawn, driveway + carport, garden |
| Doors | 13 swinging doors (open as you approach), 6 sliding glass doors |
| Navigation data | ~300 collision volumes, walkable floors and stair ramps, 34 room/zone volumes, entrance markers |

The exterior follows `public/images/reference/villa-exterior-pool.jpg`; the
interiors follow the three `interior-*.jpg` references. It is an
interpretation of those photographs — they are not plans, so proportions and
layout are designed, not surveyed.

## Rebuilding

```bash
npm run build:model     # regenerate public/models/villa.glb
npm run test:nav        # walk every room, test collisions (must pass)
npm run fetch:assets    # re-download CC0 textures, sky, leaf atlas (Poly Haven)
npm run fetch:props     # re-download + convert CC0 furniture/plant models
```

`fetch:assets` needs Python 3 with Pillow; `fetch:props` uses
`@gltf-transform/cli` (dev dependency).

## The GLB contract (to swap in a production model)

The runtime never relies on node names — only on glTF `extras` (three.js
`userData`). A replacement GLB made in Blender/3ds Max works if it follows
this contract:

| Node extras | Meaning |
|---|---|
| `{ "stage": "<stage id>" }` | Top-level group for an assembly stage (ids in `src/lib/villa/stages.ts`) |
| `{ "element": true, "stage", "floor": 0 \| 1 \| "site", "seq"? }` | One independently animated component. It drops into its final position during its stage. `floor` drives the cutaway order. |
| `{ "kind": "collider" }` | Box mesh: solid volume (walls, furniture, railings) |
| `{ "kind": "walkable" }` | Mesh: surface you can stand on (floors, stair ramps, decks) |
| `{ "kind": "room", "label", "floor" }` | Box mesh: room volume for the HUD and minimap |
| `{ "kind": "door", "id", "type": "swing" \| "slide", "openAngle" \| "slide", "collider", "center", "entry"? }` | Pivot/slider group, auto-opened in the tour; `entry` marks the front door |
| `{ "kind": "nav", "id" }` | Empties: `approach`, `porch`, `threshold`, `foyer`, `front-door`, `house-center` |
| `{ "kind": "light", "intensity" }` | Empty: interior point light |
| `{ "kind": "prop", "asset", "foot", "yaw" }` | Empty: a model from `public/models/props/<asset>.glb` is placed here |

Collider, walkable, room and nav nodes sit under groups whose extras are
`{ "helperGroup": "..." }`; they are hidden at runtime. Materials are matched by
name to the surfaces in `src/lib/villa/surfaces.ts` (unknown names keep their
own PBR maps).

## Assets and licences

Everything third-party is CC0 from [Poly Haven](https://polyhaven.com) — see
`public/textures/CREDITS.json` (linked from the site footer):
24 texture sets, the `kloofendal_48d_partly_cloudy_puresky` HDRI, the
jacaranda leaf atlas (textures only) and 11 furniture/plant models.

## Known limitations (honest)

- **Not a production architectural model.** Walls, slabs, joinery and most
  fixtures are parametric primitives with photographic materials. It reads as
  a quality real-time visualisation, not as photography. For true
  photorealism, commission a modelled GLB (Blender/3ds Max, baked lighting,
  KTX2 textures) following the contract above — the site will load it
  without code changes.
- **Furniture:** sofas, chairs, coffee/side tables, the dining set, ottomans
  and garden shrubs are real photoscans. Beds, wardrobes, kitchen units and
  bathroom fixtures are still parametric — the next assets to replace.
- **Trees** use alpha-tested leaf cards built from a real leaf atlas; there is
  no lightweight CC0 scanned tree (the scanned jacaranda is ~215 MB).
- **Compression:** the generator pre-merges each element's meshes by material
  (~1,350 meshes instead of ~8,000) and compresses the GLB with Meshopt
  (2.2 MB on disk, ~0.5 MB gzipped). Quantised geometry is restored to float
  at load (`dequantize` in `src/lib/villa/model.ts`), so production GLBs
  exported with quantisation work too. Props use Meshopt; textures are WebP.
  KTX2/Basis is not used — it needs `toktx`, which isn't available in this
  build environment.
- **Desktop main-thread cost:** building the hero scene (merging and shader
  compilation) blocks the main thread for a few seconds on first load; see
  the measurements in the README.
