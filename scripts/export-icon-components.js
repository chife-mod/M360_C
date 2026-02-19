#!/usr/bin/env node

/**
 * Export icon components separately from Figma
 * Экспортирует отдельные компоненты иконок из Figma
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'figd_MyCJzbt6ae1JwF7YvounKb5Oi0npZD0h4xYT5PO_';
const ASSETS_DIR = path.join(__dirname, '../public/assets/icons');

// Маппинг иконок - используем componentId вместо instance ID
// Эти ID нужно получить из Figma для каждого компонента иконки
const iconComponents = {
  'brands': {
    componentId: '100:383', // Tabler Icons / tabler:tag - нужно найти правильный componentId
    instanceId: 'I277:1273;100:383'
  },
  'media': {
    componentId: '100:383', // Tabler Icons / tabler:news
    instanceId: 'I277:1274;100:383'
  },
  // ... остальные
};

async function getComponentInfo(fileKey, nodeId) {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;
  
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
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function exportComponent(fileKey, componentId, name) {
  // Экспортируем компонент напрямую
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${componentId}&format=svg`;
  
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
          if (!json.images || !json.images[componentId]) {
            reject(new Error(`Component ${componentId} not found`));
            return;
          }
          resolve(json.images[componentId]);
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
  
  if (args.length < 3) {
    console.log(`
Использование:
  node scripts/export-icon-components.js <file_key> <component_id> <name>

Пример:
  node scripts/export-icon-components.js oR5AwDiD7ek4IxUOgyZCbU 100:383 brands

Для получения componentId:
  1. Откройте Figma
  2. Выберите компонент иконки (не instance, а сам компонент)
  3. Скопируйте ID из Dev Mode или URL
    `);
    process.exit(1);
  }

  const [fileKey, componentId, name] = args;

  try {
    console.log(`📥 Экспортирую компонент иконки...`);
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Component ID: ${componentId}`);
    console.log(`   Name: ${name}\n`);

    const imageUrl = await exportComponent(fileKey, componentId, name);
    
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    const outputPath = path.join(ASSETS_DIR, `${name}.svg`);
    await downloadSVG(imageUrl, outputPath);

    console.log(`✅ Успешно экспортировано: ${outputPath}`);
    console.log(`   URL: ${imageUrl}`);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
