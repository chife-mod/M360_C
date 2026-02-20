#!/usr/bin/env node

/**
 * Get detailed styles from Figma node
 * Получает детальные стили из Figma ноды
 */

const https = require('https');

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

function extractStyles(node, path = '') {
  const styles = {
    id: node.id,
    name: node.name,
    type: node.type,
    path: path,
    styles: {},
  };

  if (typeof node.opacity === 'number') {
    styles.styles.opacity = node.opacity;
  }

  // Размеры
  if (node.absoluteBoundingBox) {
    styles.styles.width = node.absoluteBoundingBox.width;
    styles.styles.height = node.absoluteBoundingBox.height;
    styles.styles.x = node.absoluteBoundingBox.x;
    styles.styles.y = node.absoluteBoundingBox.y;
  }

  // Заливка
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      styles.styles.fill = {
        type: 'solid',
        color: `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.opacity || 1})`,
        hex: rgbToHex(fill.color.r, fill.color.g, fill.color.b),
      };
    } else if (fill.type === 'GRADIENT_LINEAR') {
      styles.styles.fill = {
        type: 'gradient',
        gradientStops: fill.gradientStops,
      };
    }
  }

  // Обводка
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID') {
      styles.styles.stroke = {
        color: `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, ${stroke.opacity || 1})`,
        width: node.strokeWeight,
      };
    }
  }

  // Радиус скругления
  if (node.cornerRadius !== undefined) {
    styles.styles.borderRadius = node.cornerRadius;
  }

  // Эффекты (тени, свечение)
  if (node.effects && node.effects.length > 0) {
    styles.styles.effects = node.effects.map(effect => ({
      type: effect.type,
      radius: effect.radius,
      color: effect.color ? `rgba(${Math.round(effect.color.r * 255)}, ${Math.round(effect.color.g * 255)}, ${Math.round(effect.color.b * 255)}, ${effect.opacity || 1})` : null,
      offset: effect.offset,
    }));
  }

  // Отступы внутри (padding)
  if (node.paddingLeft !== undefined) {
    styles.styles.padding = {
      left: node.paddingLeft,
      right: node.paddingRight,
      top: node.paddingTop,
      bottom: node.paddingBottom,
    };
  }

  // Зазоры между элементами (gap)
  if (node.layoutMode) {
    styles.styles.layout = {
      mode: node.layoutMode,
      gap: node.itemSpacing,
    };
  }

  // Шрифт для текста
  if (node.style) {
    styles.styles.text = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
    };
  }

  return styles;
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Использование:
  node scripts/get-figma-styles.js <file_key> <node_id>

Пример:
  node scripts/get-figma-styles.js oR5AwDiD7ek4IxUOgyZCbU 277-1273
    `);
    process.exit(1);
  }

  const [fileKey, nodeId] = args;
  const cleanNodeId = nodeId.replace(/-/g, ':');

  try {
    console.log(`📥 Получаю стили из Figma...`);
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Node ID: ${cleanNodeId}\n`);

    const result = await getFigmaFileNodes(fileKey, cleanNodeId);
    
    if (!result.nodes || !result.nodes[cleanNodeId]) {
      console.error('❌ Нода не найдена');
      process.exit(1);
    }

    const node = result.nodes[cleanNodeId].document;
    const styles = extractStyles(node, node.name);
    
    console.log(JSON.stringify(styles, null, 2));

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
