#!/usr/bin/env node

/**
 * Get Figma Components
 * Получает список всех компонентов из Figma файла
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function getFigmaFile(fileKey) {
  const url = `https://api.figma.com/v1/files/${fileKey}`;
  
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

function findComponents(node, components = []) {
  if (!node) return components;

  // Если это компонент
  if (node.type === 'COMPONENT') {
    components.push({
      id: node.id,
      name: node.name,
      type: node.type,
    });
  }

  // Если это instance компонента
  if (node.type === 'INSTANCE' && node.componentId) {
    components.push({
      id: node.id,
      name: node.name,
      type: 'INSTANCE',
      componentId: node.componentId,
    });
  }

  // Рекурсивно обходим дочерние элементы
  if (node.children) {
    node.children.forEach(child => {
      findComponents(child, components);
    });
  }

  return components;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Использование:
  node scripts/get-figma-components.js <file_key>

Пример:
  node scripts/get-figma-components.js oR5AwDiD7ek4IxUOgyZCbU
    `);
    process.exit(1);
  }

  const fileKey = args[0];

  try {
    console.log(`📥 Получаю компоненты из Figma...`);
    console.log(`   File Key: ${fileKey}\n`);

    const fileData = await getFigmaFile(fileKey);
    
    console.log(`✅ Файл получен: ${fileData.name}\n`);

    // Ищем все компоненты
    const components = [];
    if (fileData.document && fileData.document.children) {
      fileData.document.children.forEach(page => {
        findComponents(page, components);
      });
    }

    // Убираем дубликаты по componentId
    const uniqueComponents = [];
    const seen = new Set();
    
    components.forEach(comp => {
      const key = comp.componentId || comp.id;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueComponents.push(comp);
      }
    });

    console.log(`🔍 Найдено уникальных компонентов: ${uniqueComponents.length}\n`);

    if (uniqueComponents.length > 0) {
      console.log('Компоненты:');
      uniqueComponents.slice(0, 50).forEach((comp, index) => {
        console.log(`\n${index + 1}. ${comp.name}`);
        console.log(`   ID: ${comp.id}`);
        console.log(`   Тип: ${comp.type}`);
        if (comp.componentId) {
          console.log(`   Component ID: ${comp.componentId}`);
        }
      });

      if (uniqueComponents.length > 50) {
        console.log(`\n... и ещё ${uniqueComponents.length - 50} компонентов`);
      }

      // Сохраняем в JSON
      const outputPath = path.join(__dirname, '..', 'figma-components.json');
      fs.writeFileSync(outputPath, JSON.stringify({
        file: {
          name: fileData.name,
          key: fileKey,
        },
        components: uniqueComponents,
      }, null, 2));
      console.log(`\n💾 Данные сохранены в: ${outputPath}`);
    } else {
      console.log('⚠️  Компоненты не найдены');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
