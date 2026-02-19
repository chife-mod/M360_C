#!/usr/bin/env node

/**
 * Export any Figma frame/component pixel perfect
 * Экспортирует любой фрейм/компонент из Figma pixel perfect
 * 
 * Использование:
 * node scripts/export-figma-frame.js <file_key> <node_id> <name> [format]
 * 
 * Примеры:
 * node scripts/export-figma-frame.js oR5AwDiD7ek4IxUOgyZCbU 277-1273 brands-card svg
 * node scripts/export-figma-frame.js oR5AwDiD7ek4IxUOgyZCbU 277-1273 brands-icon svg
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'figd_MyCJzbt6ae1JwF7YvounKb5Oi0npZD0h4xYT5PO_';

async function exportFigmaNode(fileKey, nodeId, format = 'svg', scale = 2) {
  // Конвертируем формат node-id из URL (277-420) в формат API (277:420)
  const cleanNodeId = nodeId.replace(/-/g, ':');
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${cleanNodeId}&format=${format}&scale=${format === 'svg' ? 1 : scale}`;
  
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
          if (!json.images || !json.images[cleanNodeId]) {
            reject(new Error(`Node ${cleanNodeId} not found in response`));
            return;
          }
          resolve(json.images[cleanNodeId]);
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

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
Использование:
  node scripts/export-figma-frame.js <file_key> <node_id> <name> [format]

Примеры:
  # Экспорт карточки Brands целиком
  node scripts/export-figma-frame.js oR5AwDiD7ek4IxUOgyZCbU 277-1273 brands-card svg
  
  # Экспорт только иконки
  node scripts/export-figma-frame.js oR5AwDiD7ek4IxUOgyZCbU I277:1273;100:383 brands-icon svg
  
  # Экспорт как PNG
  node scripts/export-figma-frame.js oR5AwDiD7ek4IxUOgyZCbU 277-1273 brands-card png

Форматы: svg, png, jpg, pdf
    `);
    process.exit(1);
  }

  const [fileKey, nodeId, name, format = 'svg'] = args;

  try {
    console.log(`📥 Экспортирую из Figma...`);
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Node ID: ${nodeId}`);
    console.log(`   Name: ${name}`);
    console.log(`   Format: ${format}\n`);

    const imageUrl = await exportFigmaNode(fileKey, nodeId, format);
    
    const ext = format.toLowerCase();
    const outputDir = ext === 'svg' 
      ? path.join(__dirname, '../public/assets/icons')
      : path.join(__dirname, '../public/assets/images');
    
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
