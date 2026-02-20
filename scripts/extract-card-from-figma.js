#!/usr/bin/env node

/**
 * Extract complete card data from Figma component-set
 * Извлекает полные данные карточки из Figma component-set
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function getFigmaFileNodes(fileKey, nodeIds) {
  const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${ids}`;
  
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

function extractCardData(cardNode) {
  if (!cardNode || !cardNode.absoluteBoundingBox) return null;
  
  const cardX = cardNode.absoluteBoundingBox.x;
  const cardY = cardNode.absoluteBoundingBox.y;
  const cardW = cardNode.absoluteBoundingBox.width;
  const cardH = cardNode.absoluteBoundingBox.height;
  
  const card = {
    id: cardNode.id,
    name: cardNode.name,
    width: cardW,
    height: cardH,
    backgroundColor: null,
    borderRadius: cardNode.cornerRadius,
    padding: {
      left: cardNode.paddingLeft,
      right: cardNode.paddingRight,
      top: cardNode.paddingTop,
      bottom: cardNode.paddingBottom,
    },
    gap: cardNode.itemSpacing,
    border: null,
    borderWidth: null,
    effects: [],
    elements: [],
  };

  // Заливка карточки
  if (cardNode.fills && cardNode.fills.length > 0) {
    const fill = cardNode.fills[0];
    if (fill.type === 'SOLID') {
      card.backgroundColor = `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.opacity || 1})`;
    }
  }

  // Обводка
  if (cardNode.strokes && cardNode.strokes.length > 0) {
    const stroke = cardNode.strokes[0];
    if (stroke.type === 'SOLID') {
      card.border = `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, ${stroke.opacity || 1})`;
      card.borderWidth = cardNode.strokeWeight;
    }
  }

  // Эффекты
  if (cardNode.effects && cardNode.effects.length > 0) {
    card.effects = cardNode.effects.map(effect => ({
      type: effect.type,
      radius: effect.radius,
      color: effect.color ? `rgba(${Math.round(effect.color.r * 255)}, ${Math.round(effect.color.g * 255)}, ${Math.round(effect.color.b * 255)}, ${effect.opacity || 1})` : null,
      offset: effect.offset,
    }));
  }

  // Извлекаем все дочерние элементы
  function traverse(node) {
    if (!node) return;
    
    if (node.absoluteBoundingBox && node.id !== cardNode.id) {
      const relX = node.absoluteBoundingBox.x - cardX;
      const relY = node.absoluteBoundingBox.y - cardY;
      
      const element = {
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.absoluteBoundingBox.width,
        height: node.absoluteBoundingBox.height,
        x: relX,
        y: relY,
        opacity: node.opacity,
      };

      // Заливка
      if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID') {
          element.fill = `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.opacity || 1})`;
        }
      }

      // Обводка
      if (node.strokes && node.strokes.length > 0) {
        const stroke = node.strokes[0];
        if (stroke.type === 'SOLID') {
          element.stroke = `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, ${stroke.opacity || 1})`;
          element.strokeWidth = node.strokeWeight;
        }
      }

      // Эффекты
      if (node.effects && node.effects.length > 0) {
        element.effects = node.effects.map(effect => ({
          type: effect.type,
          radius: effect.radius,
          color: effect.color ? `rgba(${Math.round(effect.color.r * 255)}, ${Math.round(effect.color.g * 255)}, ${Math.round(effect.color.b * 255)}, ${effect.opacity || 1})` : null,
          offset: effect.offset,
        }));
      }

      // Текст стили
      if (node.style) {
        element.textStyle = {
          fontFamily: node.style.fontFamily,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
          lineHeight: node.style.lineHeightPx,
          letterSpacing: node.style.letterSpacing,
        };
      }

      card.elements.push(element);
    }
    
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  traverse(cardNode);
  return card;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Использование:
  node scripts/extract-card-from-figma.js <file_key> [output_file]

Пример:
  node scripts/extract-card-from-figma.js oR5AwDiD7ek4IxUOgyZCbU card-data.json
    `);
    process.exit(1);
  }

  const [fileKey, outputFile] = args;

  // Все состояния карточки из component-set (node-id=222-5989)
  const cardStates = {
    default: '100:400',
    hover: '222:6010',
    active: '222:6000',
    activeHover: '277:2082',
    selected: '222:6020',
    selectedHover: '277:2092',
    disabled: '222:6030',
  };

  try {
    console.log(`📥 Извлекаю данные карточек из Figma...`);
    console.log(`   File Key: ${fileKey}\n`);

    const allCards = {};
    
    for (const [stateName, nodeId] of Object.entries(cardStates)) {
      console.log(`   Получаю состояние: ${stateName}...`);
      const result = await getFigmaFileNodes(fileKey, nodeId);
      const node = result.nodes[nodeId]?.document;
      
      if (node) {
        allCards[stateName] = extractCardData(node);
        console.log(`   ✅ ${stateName} готово`);
      } else {
        console.log(`   ❌ ${stateName} не найдено`);
      }
    }

    const output = {
      file: {
        key: fileKey,
        name: 'Market 360 Design',
      },
      cardStates: allCards,
    };

    if (outputFile) {
      const outputPath = path.join(__dirname, '..', outputFile);
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
      console.log(`\n💾 Данные сохранены в: ${outputPath}`);
    } else {
      console.log('\n' + JSON.stringify(output, null, 2));
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
