# Real Estate Atelier

A Next.js 16 (App Router) site built around one 3D house: it assembles as you
scroll, and you can walk through every room of it in first person.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
```

Environment variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemap and robots (defaults to `https://realestate-atelier.com`) |
| `ENQUIRY_WEBHOOK_URL` | Where `/api/enquiry` forwards validated enquiries (CRM, Zapier/Make hook, email service). Without it the form says delivery isn't configured and offers a pre-filled email instead. |

## Homepage storyboard

01 Hero → 02 The build (scroll assembly, 14 stages from blueprint to finished
house) → 03 The reveal (camera closes on the facade) → 04 Walk inside → 05
Interiors → 06 The collection → 07 Selected properties → 08 Contact → 09
Footer.

## The 3D house

See **[docs/villa-model.md](docs/villa-model.md)** for what the model
contains, the GLB contract for swapping in a production model, asset licences
and known limitations.

```bash
npm run build:model    # regenerate public/models/villa.glb from scripts/villa
npm run test:nav       # walkthrough connectivity + collision test
npm run fetch:assets   # CC0 textures / sky / leaf atlas (Poly Haven)
npm run fetch:props    # CC0 photoscanned furniture + plants (Poly Haven)
```

- **Walkthrough:** double-click the house in the hero, or use "Enter the
  house". WASD/arrows + mouse (click for pointer lock, Esc releases it, Esc
  again or "Exit Tour" leaves); touch joystick + drag on phones; M toggles the
  minimap. Exiting restores the page scroll position; "Resume the tour"
  returns to where you left.
- **Device tiers:** phones and low-memory devices keep the hero photograph
  until "View the house in 3D" is tapped, and use 512 px textures, no
  shadows/AO. Without WebGL the photographs remain and the tour is disabled
  with a message. `prefers-reduced-motion` stops camera drift and smoothing.

## Measured (production build, local `next start`, Lighthouse 12)

| | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Mobile (default throttling) | 98 | 100 | 100 | 100 | 0.8 s | 2.4 s | 50 ms | 0 |
| Desktop (GPU enabled) | 67 | 100 | 100 | 100 | 0.2 s | 0.6 s | 2.1 s | 0 |

Desktop TBT comes from building the 3D hero scene after load (shader
compilation and the final merge). Earlier mobile runs varied between 91 and
98. Lighthouse's own headless Chrome has no GPU and
can't complete the desktop run with the 3D hero; the desktop row used
headless Chrome with the machine's GPU.
