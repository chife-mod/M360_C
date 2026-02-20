#!/usr/bin/env node

/**
 * Batch export assets from Figma
 * Пакетный экспорт ассетов из Figma
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const ASSETS_DIR = path.join(__dirname, '../public/assets');

async function exportFigmaImage(fileKey, nodeId, format = 'svg') {
  // Убираем префикс I и всё после ; для получения чистого ID
  const cleanNodeId = nodeId.replace(/^I/, '').split(';')[0];
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${cleanNodeId}&format=${format}`;
  
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

async function exportAsset(fileKey, nodeId, name, format = 'svg') {
  try {
    const imageUrl = await exportFigmaImage(fileKey, nodeId, format);
    
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
      // Для PNG/JPG используем обычную загрузку
      return new Promise((resolve, reject) => {
        https.get(imageUrl, (res) => {
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

    return outputPath;
  } catch (error) {
    throw new Error(`Failed to export ${name}: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Использование:
  node scripts/export-figma-assets-batch.js <file_key> <mapping_json>

Пример:
  node scripts/export-figma-assets-batch.js oR5AwDiD7ek4IxUOgyZCbU '{"brands":"I277:1273;100:383","media":"I277:1274;100:383"}'
    `);
    process.exit(1);
  }

  const [fileKey, mappingJson] = args;
  const mapping = JSON.parse(mappingJson);

  console.log(`📦 Пакетный экспорт ассетов из Figma\n`);
  console.log(`   File Key: ${fileKey}`);
  console.log(`   Ассетов для экспорта: ${Object.keys(mapping).length}\n`);

  const results = [];
  
  for (const [name, nodeId] of Object.entries(mapping)) {
    try {
      console.log(`📥 Экспортирую ${name}...`);
      const outputPath = await exportAsset(fileKey, nodeId, name, 'svg');
      console.log(`✅ ${name} → ${outputPath}\n`);
      results.push({ name, success: true, path: outputPath });
    } catch (error) {
      console.error(`❌ Ошибка при экспорте ${name}: ${error.message}\n`);
      results.push({ name, success: false, error: error.message });
    }
  }

  console.log('\n📊 Результаты:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Успешно: ${successful}`);
  console.log(`❌ Ошибок: ${failed}`);
  
  if (failed > 0) {
    console.log('\nНе удалось экспортировать:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n🎉 Экспорт завершен!');
}

main();
