#!/usr/bin/env node

/**
 * Pixel-perfect Figma icon exporter
 * 
 * Uses Figma Images API to export icons as actual files (like Figma Export),
 * preserving the 32x32 frame, viewBox, stroke-width, and all proportions.
 * 
 * Only two modifications are made to the raw SVG:
 *   1. stroke="white" → stroke="currentColor" (for CSS color control)
 *   2. opacity removed from <g> (controlled by parent component instead)
 * 
 * Usage:
 *   node scripts/export-figma-icons-clean.js [--icon=brands] [--format=svg]
 * 
 * Options:
 *   --icon=NAME    Export a single icon by name (e.g. --icon=brands)
 *   --format=FMT   Export format: svg (default), png
 *   --raw          Don't modify the SVG at all (save exactly as Figma exports)
 *   --list         Just list available icons without exporting
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = "oR5AwDiD7ek4IxUOgyZCbU";
const OUT_DIR = path.join(__dirname, "../public/assets/icons");

// Icon instance node IDs (32x32 frames inside card instances)
const ICONS = {
  brands:       "I277:1273;100:383",
  media:        "I277:1274;100:383",
  pricing:      "I277:1275;100:383",
  categories:   "I277:1276;100:383",
  social:       "I277:1278;100:383",
  availability: "I277:1279;100:383",
  products:     "I277:1280;100:383",
  influencers:  "I277:1281;100:383",
  ads:          "I277:1283;100:383",
  novelties:    "I277:1284;100:383",
  newsletters:  "I277:1285;100:383",
  evisibility:  "I277:1286;100:383",
  retailers:    "I277:1288;100:383",
  reviews:      "I277:1289;100:383",
  seo:          "I277:1290;100:383",
  trending:     "I277:1291;100:383",
  "support-chats": "I306:1290;100:383",
  "reload": "I306:1561;306:1557",
};

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          return;
        }
        resolve(data);
      });
    }).on("error", reject);
  });
}

function downloadBinary(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }
      const stream = fs.createWriteStream(outputPath);
      res.pipe(stream);
      stream.on("finish", () => { stream.close(); resolve(); });
      stream.on("error", reject);
    }).on("error", reject);
  });
}

async function getExportUrl(nodeId, format = "svg") {
  const cleanId = String(nodeId).replace(/-/g, ":");
  const params = new URLSearchParams({
    ids: cleanId,
    format,
    scale: format === "svg" ? "1" : "2",
  });
  const url = `https://api.figma.com/v1/images/${FILE_KEY}?${params}`;
  const raw = await httpsGet(url, { "X-Figma-Token": FIGMA_TOKEN });
  const json = JSON.parse(raw);

  if (json.err) throw new Error(`Figma API error: ${json.err}`);
  const href = json.images?.[cleanId];
  if (!href) throw new Error(`No export URL for node ${cleanId}`);
  return href;
}

/**
 * Minimal SVG processing for CSS integration:
 * - Replace ALL stroke/fill colors (except "none") with "currentColor" for CSS control
 *   Some icons in Figma have baked-in highlight colors (#AB56FF, #46FEC3) from active
 *   state previews — these must also become currentColor so the card component controls color.
 * - Remove opacity from <g> elements (parent component controls opacity per state)
 * Everything else (viewBox, width, height, stroke-width, paths) stays untouched.
 */
function processForCSS(svg) {
  return svg
    .replace(/stroke="(?!none)[^"]+"/g, 'stroke="currentColor"')
    .replace(/fill="(?!none)[^"]+"/g, 'fill="currentColor"')
    .replace(/<g\s+opacity="[^"]*">/g, "<g>");
}

async function exportIcon(name, nodeId, format, raw) {
  const href = await getExportUrl(nodeId, format);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${name}.${format}`);

  if (format === "svg") {
    const svg = await httpsGet(href);
    fs.writeFileSync(outPath, raw ? svg : processForCSS(svg), "utf8");
  } else {
    await downloadBinary(href, outPath);
  }

  return outPath;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { icon: null, format: "svg", raw: false, list: false };
  for (const arg of args) {
    if (arg.startsWith("--icon=")) opts.icon = arg.split("=")[1];
    else if (arg.startsWith("--format=")) opts.format = arg.split("=")[1];
    else if (arg === "--raw") opts.raw = true;
    else if (arg === "--list") opts.list = true;
  }
  return opts;
}

async function main() {
  const opts = parseArgs();

  if (opts.list) {
    console.log("Available icons:");
    for (const [name, nodeId] of Object.entries(ICONS)) {
      console.log(`  ${name.padEnd(14)} ${nodeId}`);
    }
    return;
  }

  const targets = opts.icon
    ? [[opts.icon, ICONS[opts.icon]]]
    : Object.entries(ICONS);

  if (opts.icon && !ICONS[opts.icon]) {
    console.error(`Unknown icon: ${opts.icon}`);
    console.error(`Available: ${Object.keys(ICONS).join(", ")}`);
    process.exit(1);
  }

  console.log(`Exporting ${targets.length} icon(s) as ${opts.format.toUpperCase()}${opts.raw ? " (raw)" : ""}...\n`);

  let ok = 0;
  let fail = 0;

  for (const [name, nodeId] of targets) {
    process.stdout.write(`  ${name.padEnd(14)} `);
    try {
      const outPath = await exportIcon(name, nodeId, opts.format, opts.raw);
      console.log(`OK  ${outPath}`);
      ok++;
    } catch (e) {
      console.log(`FAIL  ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} OK, ${fail} failed`);
  if (fail) process.exit(1);
}

main();
