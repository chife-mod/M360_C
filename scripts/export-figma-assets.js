#!/usr/bin/env node

/**
 * Figma Assets Exporter
 * Экспортирует PNG и SVG из Figma в папку assets проекта
 * 
 * Использование:
 * node scripts/export-figma-assets.js <file_key> <node_id> [format]
 * 
 * Примеры:
 * node scripts/export-figma-assets.js oR5AwDiD7ek4IxUOgyZCbU 277-420 png
 * node scripts/export-figma-assets.js oR5AwDiD7ek4IxUOgyZCbU 277-420 svg
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const ASSETS_DIR = path.join(__dirname, '../public/assets');

// Создаём папки если их нет
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function exportFigmaImage(fileKey, nodeId, format = 'png', scale = 2) {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=${format}&scale=${scale}`;
  
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
      },
    };

    https.get(url, options, (res) => {
      let data = '';

      if (res.statusCode !== 200) {
        res.on('data', () => {});
        res.on('end', () => {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        });
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.err) {
            reject(new Error(`Figma API Error: ${json.err}`));
            return;
          }
          if (!json.images || !json.images[nodeId]) {
            console.error('Response:', JSON.stringify(json, null, 2));
            reject(new Error(`Node ${nodeId} not found. Available: ${Object.keys(json.images || {}).join(', ')}`));
            return;
          }
          resolve(json.images[nodeId]);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });

      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function exportSVG(fileKey, nodeId) {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=svg`;
  
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
      },
    };

    https.get(url, options, (res) => {
      let data = '';

      if (res.statusCode !== 200) {
        res.on('data', () => {});
        res.on('end', () => {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        });
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.err) {
            reject(new Error(`Figma API Error: ${json.err}`));
            return;
          }
          if (!json.images || !json.images[nodeId]) {
            console.error('Response:', JSON.stringify(json, null, 2));
            reject(new Error(`Node ${nodeId} not found. Available: ${Object.keys(json.images || {}).join(', ')}`));
            return;
          }
          resolve(json.images[nodeId]);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function downloadSVG(svgUrl, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(svgUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download SVG: ${res.statusCode}`));
        return;
      }

      let svgContent = '';
      res.on('data', (chunk) => {
        svgContent += chunk;
      });

      res.on('end', () => {
        fs.writeFileSync(outputPath, svgContent, 'utf8');
        resolve(outputPath);
      });
    }).on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Использование:
  node scripts/export-figma-assets.js <file_key> <node_id> [format] [name]

Примеры:
  node scripts/export-figma-assets.js oR5AwDiD7ek4IxUOgyZCbU 277-420 png icon-name
  node scripts/export-figma-assets.js oR5AwDiD7ek4IxUOgyZCbU 277-420 svg icon-name

Форматы: png, svg, jpg, pdf
    `);
    process.exit(1);
  }

  const [fileKey, nodeId, format = 'png', name = `figma-${nodeId}`] = args;

  try {
    console.log(`📥 Экспортирую ${format.toUpperCase()} из Figma...`);
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Node ID: ${nodeId}`);
    console.log(`   Format: ${format}`);

    let imageUrl;
    
    if (format.toLowerCase() === 'svg') {
      imageUrl = await exportSVG(fileKey, nodeId);
    } else {
      imageUrl = await exportFigmaImage(fileKey, nodeId, format);
    }

    if (!imageUrl) {
      throw new Error('Не удалось получить URL изображения');
    }

    const ext = format.toLowerCase();
    const outputDir = ext === 'svg' 
      ? path.join(ASSETS_DIR, 'icons')
      : path.join(ASSETS_DIR, 'images');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${name}.${ext}`);

    if (format.toLowerCase() === 'svg') {
      await downloadSVG(imageUrl, outputPath);
    } else {
      await downloadFile(imageUrl, outputPath);
    }

    console.log(`✅ Успешно экспортировано: ${outputPath}`);
    console.log(`   URL: ${imageUrl}`);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
