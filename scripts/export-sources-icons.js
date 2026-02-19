#!/usr/bin/env node

/**
 * Export all icons from Sources section
 * Экспортирует все иконки из секции Sources
 */

const { execSync } = require('child_process');
const path = require('path');

// Маппинг названий источников к их возможным node-id
// Эти ID нужно будет получить из Figma или обновить после поиска
const sourcesMapping = {
  brands: null,
  media: null,
  pricing: null,
  categories: null,
  social: null,
  availability: null,
  products: null,
  influencers: null,
  ads: null,
  novelties: null,
  newsletters: null,
  evisibility: null,
  retailers: null,
  reviews: null,
  seo: null,
  trending: null,
};

const fileKey = 'oR5AwDiD7ek4IxUOgyZCbU';
const exportScript = path.join(__dirname, 'export-figma-assets.js');

async function main() {
  console.log('📦 Экспорт иконок Sources из Figma\n');
  console.log('⚠️  Для работы нужно указать node-id каждой иконки.\n');
  console.log('Как получить node-id:');
  console.log('1. Откройте Figma файл');
  console.log('2. Выберите иконку в секции Sources');
  console.log('3. Скопируйте node-id из URL или Dev Mode');
  console.log('4. Обновите sourcesMapping в этом скрипте\n');
  
  console.log('Текущий маппинг:');
  Object.entries(sourcesMapping).forEach(([name, nodeId]) => {
    console.log(`  ${name}: ${nodeId || 'не указан'}`);
  });
  
  console.log('\n💡 После указания node-id запустите:');
  console.log('   node scripts/export-sources-icons.js\n');
}

main();
