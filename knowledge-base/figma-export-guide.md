# Figma Asset Export Guide

How to download SVG, PNG @2x, PNG @3x from Figma — pixel-perfect, preserving proportions and frames.

## How It Works

We use the **Figma Images API** (`/v1/images/`) — the same endpoint Figma uses internally when you click "Export". It **renders** the node server-side and returns a temporary download URL (hosted on S3). This guarantees the exported file is identical to what you'd get from the Figma UI.

The flow is two HTTP requests:

```
1. GET https://api.figma.com/v1/images/{file_key}?ids={node_id}&format=svg&scale=1
   → Returns: { "images": { "node_id": "https://figma-alpha-api.s3.amazonaws.com/..." } }

2. GET {s3_url}
   → Returns: the actual SVG/PNG file content
```

No MCP servers. No webhooks. No external dependencies. Just Node.js built-in `https`.

## Prerequisites

- **Figma Personal Access Token** — stored in scripts as fallback, or set via env:
  ```bash
  export FIGMA_TOKEN="figd_..."
  ```
- **File Key** — from the Figma URL:
  ```
  https://www.figma.com/design/[FILE_KEY]/Project-Name?node-id=...
                                 ^^^^^^^^
  ```
- **Node ID** — from the URL parameter `node-id=142-159` (use as `142:159` or `142-159`, scripts handle both)

## Quick Export (Any Figma File)

Run this directly from the project root — works with **any** Figma file you have access to:

```bash
# SVG
node scripts/export-figma-frame.js <file_key> <node_id> <output_name> svg

# PNG @2x (default)
node scripts/export-figma-frame.js <file_key> <node_id> <output_name> png

# Example: export logo from Eplug-Web
node scripts/export-figma-frame.js NsarAMa9SQMVyRCQDvgqg3 142-159 eplug-001 svg
node scripts/export-figma-frame.js NsarAMa9SQMVyRCQDvgqg3 142-159 eplug-001 png
```

Output locations:
- SVG → `public/assets/icons/{name}.svg`
- PNG/JPG → `public/assets/images/{name}.png`

## Export All 16 Source Icons (Market 360)

Uses the dedicated batch script with hardcoded node IDs for the Verticals section:

```bash
# Export all icons as clean SVGs (currentColor, no opacity, preserving 32x32 frame)
npm run figma:icons-clean

# Export a single icon
npm run figma:icons-clean -- --icon=brands

# Export as raw SVG (zero modifications, exactly as Figma renders)
npm run figma:icons-clean -- --raw

# Export as PNG instead
npm run figma:icons-clean -- --format=png

# List all available icon names
npm run figma:icons-clean -- --list
```

Output: `public/assets/icons/{name}.svg`

### What the clean export does to SVGs

Only two modifications (at export time, zero at runtime):

| Modification | Why |
|---|---|
| `stroke="white"` → `stroke="currentColor"` | So the card component can control icon color via CSS `color` property |
| `<g opacity="0.4">` → `<g>` | So the card component can control opacity per state (default, hover, active, etc.) |

Everything else is preserved exactly as Figma exports it:
- `width="32" height="32"` — frame dimensions
- `viewBox="0 0 32 32"` — coordinate system
- `stroke-width="2"` — original line thickness
- All path data — untouched

## Export SVG + PNG @2x + PNG @3x (All at Once)

For cases when you need all formats of the same node, run this inline script:

```bash
cd m360-landing

node -e "
const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'figd_MyCJzbt6ae1JwF7YvounKb5Oi0npZD0h4xYT5PO_';
const FILE_KEY = process.argv[2];
const NODE_ID = process.argv[3].replace(/-/g, ':');
const NAME = process.argv[4];
const OUT_DIR = 'public/assets';

function get(url, hdrs) {
  return new Promise((ok, fail) => {
    https.get(url, { headers: hdrs }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => res.statusCode === 200 ? ok(d) : fail(new Error('HTTP ' + res.statusCode)));
    }).on('error', fail);
  });
}

function download(url, out) {
  return new Promise((ok, fail) => {
    https.get(url, res => {
      if (res.statusCode !== 200) { fail(new Error('HTTP ' + res.statusCode)); return; }
      const s = fs.createWriteStream(out); res.pipe(s);
      s.on('finish', () => { s.close(); ok(); }); s.on('error', fail);
    }).on('error', fail);
  });
}

async function exp(fmt, scale, suffix) {
  const params = new URLSearchParams({ ids: NODE_ID, format: fmt, scale: String(scale) });
  const raw = await get('https://api.figma.com/v1/images/' + FILE_KEY + '?' + params, { 'X-Figma-Token': FIGMA_TOKEN });
  const href = JSON.parse(raw).images?.[NODE_ID];
  if (!href) throw new Error('No URL for ' + fmt);
  const out = path.join(OUT_DIR, NAME + suffix);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (fmt === 'svg') { fs.writeFileSync(out, await get(href, {}), 'utf8'); }
  else { await download(href, out); }
  console.log('  ' + out + ' (' + fmt + (scale > 1 ? ' @' + scale + 'x' : '') + ')');
}

(async () => {
  console.log('Exporting ' + NAME + ' from ' + FILE_KEY + ' node ' + NODE_ID + '...');
  await exp('svg', 1, '.svg');
  await exp('png', 2, '.png');
  await exp('png', 3, '@3x.png');
  console.log('Done!');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
" <file_key> <node_id> <output_name>
```

**Example:**

```bash
node -e "..." NsarAMa9SQMVyRCQDvgqg3 142-159 eplug-001
```

Produces:
- `public/assets/eplug-001.svg`
- `public/assets/eplug-001.png` (2x)
- `public/assets/eplug-001@3x.png` (3x)

## Exploring Figma Structure

Before exporting, you may need to find the right node ID. Use these scripts:

```bash
# Get full file structure and find icons/components
npm run figma:structure -- oR5AwDiD7ek4IxUOgyZCbU

# Get detailed styles (fills, strokes, fonts, effects) from a specific node
node scripts/get-figma-styles.js oR5AwDiD7ek4IxUOgyZCbU 277-1273

# Find and inspect a specific node
node scripts/find-figma-node.js oR5AwDiD7ek4IxUOgyZCbU 286-4723
```

## How to Find the Node ID

1. Open the Figma file in browser
2. Select the frame/component you want to export
3. Look at the URL — the `node-id` parameter is your node ID:
   ```
   https://www.figma.com/design/NsarAMa9SQMVyRCQDvgqg3/Eplug-Web?node-id=142-159
                                                                           ^^^^^^^
   ```
4. Use `142-159` or `142:159` — both work (scripts convert `-` to `:` automatically)

## API Reference

| Endpoint | Purpose |
|---|---|
| `GET /v1/images/{file_key}?ids={node_ids}&format=svg&scale=1` | Export as SVG |
| `GET /v1/images/{file_key}?ids={node_ids}&format=png&scale=2` | Export as PNG @2x |
| `GET /v1/images/{file_key}?ids={node_ids}&format=png&scale=3` | Export as PNG @3x |
| `GET /v1/files/{file_key}/nodes?ids={node_ids}&depth=N` | Inspect node structure |
| `GET /v1/files/{file_key}` | Get full file structure |

All requests require header: `X-Figma-Token: {your_token}`

Supported formats: `svg`, `png`, `jpg`, `pdf`

Scale parameter: `1` to `4` (ignored for SVG, which is always vector)

## Available npm Scripts

| Script | Command |
|---|---|
| `npm run figma:icons-clean` | Batch export all 16 source icons (clean SVG) |
| `npm run figma:export` | Export single asset (any format) |
| `npm run figma:frame` | Export any frame/component |
| `npm run figma:structure` | Explore file structure |
| `npm run figma:icons` | Legacy icon export |
