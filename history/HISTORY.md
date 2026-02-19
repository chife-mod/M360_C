# Project History Log

---

## 2026-02-18 — Card System & Interactive Grid

### Pixel-perfect DataCard (7 states)
- Inspected Figma component-set `node-id=222-5989` via REST API
- Built `DataCard.tsx` with all 7 states: Default, Hover, Active, Active Hover, Selected, Selected Hover, Disable
- Styles extracted directly from Figma: sizes, colors, borders, shadows, blur ellipses
- Disable state: `dotted` border 2px, no corner glows, icon stroke-width 1px (vs 2px on others)
- Corner white glows (Ellipse 850/851) hidden in Disable
- Bottom green glow (Ellipse 849) only in Selected / Selected Hover

### Icon export
- Exported 16 clean SVG icons from Figma frame `node-id=289-4743`
- Saved to `public/assets/final-icons/` and `public/assets/icons/`
- Icons processed: `currentColor` stroke/fill, no `<g>` opacity, correct 32×32 frame

### Card demo page (`/card-demo`)
- Single Brands card with state switcher (7 states)
- Figma PNG reference side-by-side for comparison

### Main page (`/`)
- Clean 4×4 grid, gap 4px (matches Figma frame `node-id=277-3520`)
- Background `#111539`
- All cards interactive: hover, click to select

### Unique accent colors per card
- Each of 16 verticals has its own color for Selected state (icon + text + dot + bottom glow)
- Colors shuffled to maximize contrast between neighbors
- Blues/purples boosted in saturation

### Card connections (interactive prototype)
- `cardConnections` map in `sources-data.ts`: each card has 3 related cards
- Click a card → it enters Selected state, its 3 connections enter Active state
- Example: Brands → Pricing, Products, Availability

---
