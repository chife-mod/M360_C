#!/usr/bin/env node

/**
 * Extract icon from Figma SVG
 * Извлекает только иконку из SVG, убирая фрейм карточки
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../public/assets/icons');

function extractIcon(svgContent) {
  // Парсим SVG
  const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!svgMatch) return svgContent;

  // Ищем группу с иконкой (обычно это группа с opacity="0.4" или path с stroke)
  // Иконка обычно находится в группе <g opacity="0.4"> или просто path элементы
  
  // Извлекаем все path элементы, которые являются частью иконки
  const paths = svgContent.match(/<path[^>]*>/g) || [];
  
  // Находим группу с opacity="0.4" - это обычно иконка
  const iconGroupMatch = svgContent.match(/<g[^>]*opacity="0\.4"[^>]*>([\s\S]*?)<\/g>/);
  
  if (iconGroupMatch) {
    const iconContent = iconGroupMatch[1];
    // Создаем новый SVG только с иконкой
    const newSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
${iconContent}
</g>
</svg>`;
    return newSvg;
  }

  // Если не нашли группу, возвращаем оригинал
  return svgContent;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Использование:
  node scripts/extract-icon-from-svg.js <icon_name>

Пример:
  node scripts/extract-icon-from-svg.js brands
    `);
    process.exit(1);
  }

  const iconName = args[0];
  const svgPath = path.join(ASSETS_DIR, `${iconName}.svg`);

  if (!fs.existsSync(svgPath)) {
    console.error(`❌ Файл не найден: ${svgPath}`);
    process.exit(1);
  }

  try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const extractedIcon = extractIcon(svgContent);
    
    // Сохраняем обратно
    fs.writeFileSync(svgPath, extractedIcon);
    console.log(`✅ Иконка извлечена: ${iconName}.svg`);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
