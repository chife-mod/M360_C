#!/usr/bin/env node

/**
 * Export a batch of SVG icons from Figma by node id.
 *
 * Usage:
 *   FIGMA_TOKEN="..." node scripts/export-figma-icons-batch.js <file_key>
 *
 * Outputs:
 *   public/assets/icons/<name>.svg
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

const OUT_DIR = path.join(__dirname, "../public/assets/icons");

function figmaExportUrl(fileKey, nodeId) {
  const cleanNodeId = String(nodeId).replace(/-/g, ":");
  const qp = new URLSearchParams({ ids: cleanNodeId, format: "svg", scale: "1" });
  return { cleanNodeId, url: `https://api.figma.com/v1/images/${fileKey}?${qp.toString()}` };
}

async function getExportUrl(fileKey, nodeId) {
  const { cleanNodeId, url } = figmaExportUrl(fileKey, nodeId);

  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { "X-Figma-Token": FIGMA_TOKEN } },
        (res) => {
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
              return;
            }
            const json = JSON.parse(data);
            if (json.err) {
              reject(new Error(json.err));
              return;
            }
            const href = json.images?.[cleanNodeId];
            if (!href) {
              reject(new Error(`No export URL for node ${cleanNodeId}`));
              return;
            }
            resolve(href);
          });
        }
      )
      .on("error", reject);
  });
}

async function downloadText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Download HTTP ${res.statusCode}: ${res.statusMessage}`));
            return;
          }
          resolve(data);
        });
      })
      .on("error", reject);
  });
}

function normalizeTablerSvg(svg) {
  // Keep viewBox; remove hard-coded width/height so CSS sizing works.
  return svg
    .replace(/\s(width|height)=\"[^\"]*\"/g, "")
    // Prefer currentColor for easy tinting if needed later.
    .replace(/stroke=\"white\"/g, 'stroke="currentColor"')
    .replace(/fill=\"white\"/g, 'fill="currentColor"');
}

async function exportOne(fileKey, name, nodeId) {
  const href = await getExportUrl(fileKey, nodeId);
  const svg = await downloadText(href);
  const outPath = path.join(OUT_DIR, `${name}.svg`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, normalizeTablerSvg(svg), "utf8");
  return outPath;
}

async function main() {
  const [fileKey] = process.argv.slice(2);
  if (!fileKey) {
    console.error("Usage: FIGMA_TOKEN=... node scripts/export-figma-icons-batch.js <file_key>");
    process.exit(1);
  }

  // Icon INSTANCE node ids from your Verticals grid (node-id=277-420).
  const icons = {
    brands: "I277:1273;100:383",
    media: "I277:1274;100:383",
    pricing: "I277:1275;100:383",
    categories: "I277:1276;100:383",
    social: "I277:1278;100:383",
    availability: "I277:1279;100:383",
    products: "I277:1280;100:383",
    influencers: "I277:1281;100:383",
    ads: "I277:1283;100:383",
    novelties: "I277:1284;100:383",
    newsletters: "I277:1285;100:383",
    evisibility: "I277:1286;100:383",
    retailers: "I277:1288;100:383",
    reviews: "I277:1289;100:383",
    seo: "I277:1290;100:383",
    trending: "I277:1291;100:383",
  };

  const results = [];
  for (const [name, nodeId] of Object.entries(icons)) {
    process.stdout.write(`Export ${name}… `);
    try {
      const out = await exportOne(fileKey, name, nodeId);
      results.push({ name, ok: true, out });
      process.stdout.write("OK\n");
    } catch (e) {
      results.push({ name, ok: false, err: e?.message || String(e) });
      process.stdout.write(`FAIL (${e?.message || e})\n`);
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  console.log(`\nDone. OK=${ok}, FAIL=${fail}`);
  if (fail) {
    console.log("Failed:");
    for (const r of results.filter((x) => !x.ok)) console.log(`- ${r.name}: ${r.err}`);
  }
}

main();

