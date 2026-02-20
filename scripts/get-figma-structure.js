#!/usr/bin/env node

/**
 * Figma File Structure Explorer
 * Получает структуру файла Figma и находит все иконки/компоненты
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

function findIcons(node, path = '', icons = []) {
  if (!node) return icons;

  const currentPath = path ? `${path} > ${node.name}` : node.name;
  
  // Проверяем, является ли это иконкой или компонентом
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    icons.push({
      id: node.id,
      name: node.name,
      type: node.type,
      path: currentPath,
    });
  }

  // Проверяем, содержит ли название "icon" или "Icon"
  if (node.name && (node.name.toLowerCase().includes('icon') || 
                    node.name.toLowerCase().includes('иконка') ||
                    node.name.toLowerCase().includes('brands') ||
                    node.name.toLowerCase().includes('media') ||
                    node.name.toLowerCase().includes('pricing') ||
                    node.name.toLowerCase().includes('categories') ||
                    node.name.toLowerCase().includes('social') ||
                    node.name.toLowerCase().includes('availability') ||
                    node.name.toLowerCase().includes('products') ||
                    node.name.toLowerCase().includes('influencers') ||
                    node.name.toLowerCase().includes('ads') ||
                    node.name.toLowerCase().includes('novelties') ||
                    node.name.toLowerCase().includes('newsletters') ||
                    node.name.toLowerCase().includes('e-visibility') ||
                    node.name.toLowerCase().includes('retailers') ||
                    node.name.toLowerCase().includes('reviews') ||
                    node.name.toLowerCase().includes('seo') ||
                    node.name.toLowerCase().includes('trending'))) {
    icons.push({
      id: node.id,
      name: node.name,
      type: node.type,
      path: currentPath,
    });
  }

  // Рекурсивно обходим дочерние элементы
  if (node.children) {
    node.children.forEach(child => {
      findIcons(child, currentPath, icons);
    });
  }

  return icons;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Использование:
  node scripts/get-figma-structure.js <file_key> [output_file]

Примеры:
  node scripts/get-figma-structure.js oR5AwDiD7ek4IxUOgyZCbU
  node scripts/get-figma-structure.js oR5AwDiD7ek4IxUOgyZCbU structure.json
    `);
    process.exit(1);
  }

  const [fileKey, outputFile] = args;

  try {
    console.log(`📥 Получаю структуру файла Figma...`);
    console.log(`   File Key: ${fileKey}\n`);

    const fileData = await getFigmaFile(fileKey);
    
    console.log(`✅ Файл получен: ${fileData.name}`);
    console.log(`   Последнее изменение: ${fileData.lastModified}`);
    console.log(`   Версия: ${fileData.version}\n`);

    // Ищем все иконки
    const icons = [];
    if (fileData.document && fileData.document.children) {
      fileData.document.children.forEach(page => {
        findIcons(page, page.name, icons);
      });
    }

    console.log(`\n🔍 Найдено потенциальных иконок: ${icons.length}\n`);

    if (icons.length > 0) {
      console.log('Иконки:');
      icons.forEach((icon, index) => {
        console.log(`\n${index + 1}. ${icon.name}`);
        console.log(`   ID: ${icon.id}`);
        console.log(`   Тип: ${icon.type}`);
        console.log(`   Путь: ${icon.path}`);
      });

      // Сохраняем в JSON если указан output файл
      if (outputFile) {
        const outputPath = path.join(__dirname, '..', outputFile);
        fs.writeFileSync(outputPath, JSON.stringify({
          file: {
            name: fileData.name,
            key: fileKey,
            lastModified: fileData.lastModified,
          },
          icons: icons,
        }, null, 2));
        console.log(`\n💾 Данные сохранены в: ${outputPath}`);
      }

      // Создаём маппинг для экспорта
      console.log(`\n📋 Маппинг для экспорта:`);
      console.log(`npm run figma:icons ${fileKey} '{`);
      icons.forEach(icon => {
        const name = icon.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log(`  "${name}": "${icon.id}",`);
      });
      console.log(`}'`);
    } else {
      console.log('⚠️  Иконки не найдены. Попробуйте указать конкретный node-id.');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.message.includes('404')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Неверный file_key');
      console.error('   - Нет доступа к файлу (проверьте токен)');
      console.error('   - Файл приватный и требует доступа');
    }
    process.exit(1);
  }
}

main();
