#!/usr/bin/env node

/**
 * Export all icons from Verticals section
 * Экспортирует все иконки из секции Verticals
 */

const { execSync } = require('child_process');
const path = require('path');

const fileKey = 'oR5AwDiD7ek4IxUOgyZCbU';
const exportScript = path.join(__dirname, 'export-figma-assets.js');

// Маппинг иконок из найденных в структуре Figma
// Формат: "название": "node-id"
const iconsMapping = {
  // Первая строка
  'brands': 'I277:1273;100:383',        // tabler:tag
  'media': 'I277:1274;100:383',         // tabler:news
  'pricing': 'I277:1275;100:383',       // tabler:receipt-dollar
  'categories': 'I277:1276;100:383',    // tabler:category
  
  // Вторая строка
  'social': 'I277:1278;100:383',        // tabler:users
  'availability': 'I277:1279;100:383',  // tabler:packages (или может быть другой)
  'products': 'I277:1280;100:383',      // tabler:box
  'influencers': 'I277:1281;100:383',  // tabler:user-star
  
  // Третья строка
  'ads': 'I277:1283;100:383',          // tabler:ad
  'novelties': 'I277:1284;100:383',    // flame
  'newsletters': 'I277:1285;100:383',  // tabler:mail
  'evisibility': 'I277:1286;100:383',  // tabler:eye
  
  // Четвертая строка
  'retailers': 'I277:1288;100:383',    // tabler:building-store
  'reviews': 'I277:1289;100:383',      // tabler:star-half-filled
  'seo': 'I277:1290;100:383',          // tabler:chart-line
  'trending': 'I277:1291;100:383',     // tabler:trending-up
};

async function exportIcon(name, nodeId) {
  try {
    console.log(`📥 Экспортирую ${name}...`);
    // Конвертируем формат node-id для API (убираем префикс I если есть, оставляем только ID)
    const apiNodeId = nodeId.replace(/^I/, '').replace(/;.*$/, '');
    execSync(`node "${exportScript}" ${fileKey} ${apiNodeId} svg ${name}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log(`✅ ${name} готово\n`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при экспорте ${name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('📦 Экспорт иконок Verticals из Figma\n');
  console.log(`Найдено иконок для экспорта: ${Object.keys(iconsMapping).length}\n`);

  const results = [];
  
  for (const [name, nodeId] of Object.entries(iconsMapping)) {
    const success = await exportIcon(name, nodeId);
    results.push({ name, success });
  }

  console.log('\n📊 Результаты:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Успешно: ${successful}`);
  console.log(`❌ Ошибок: ${failed}`);
  
  if (failed > 0) {
    console.log('\nНе удалось экспортировать:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}`);
    });
  }
  
  console.log('\n🎉 Экспорт завершен!');
  console.log(`Иконки сохранены в: public/assets/icons/`);
}

main();
