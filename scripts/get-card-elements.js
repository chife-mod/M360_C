#!/usr/bin/env node

/**
 * Get all card elements with relative positions
 * Получает все элементы карточки с относительными позициями
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

function extractRelativePositions(cardNode, elements = []) {
  if (!cardNode || !cardNode.absoluteBoundingBox) return elements;
  
  const cardX = cardNode.absoluteBoundingBox.x;
  const cardY = cardNode.absoluteBoundingBox.y;
  
  function traverse(node, parent = null) {
    if (!node) return;
    
    if (node.absoluteBoundingBox) {
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
          element.fill = {
            r: Math.round(fill.color.r * 255),
            g: Math.round(fill.color.g * 255),
            b: Math.round(fill.color.b * 255),
            a: fill.opacity || 1,
            rgba: `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.opacity || 1})`,
          };
        }
      }
      
      // Обводка
      if (node.strokes && node.strokes.length > 0) {
        const stroke = node.strokes[0];
        if (stroke.type === 'SOLID') {
          element.stroke = {
            color: `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, ${stroke.opacity || 1})`,
            width: node.strokeWeight,
          };
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
      
      elements.push(element);
    }
    
    if (node.children) {
      node.children.forEach(child => traverse(child, node));
    }
  }
  
  traverse(cardNode);
  return elements;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Использование:
  node scripts/get-card-elements.js <file_key> <card_node_id>

Пример:
  node scripts/get-card-elements.js oR5AwDiD7ek4IxUOgyZCbU 100-400
    `);
    process.exit(1);
  }

  const [fileKey, cardNodeId] = args;
  const cleanNodeId = cardNodeId.replace(/-/g, ':');

  try {
    console.log(`📥 Получаю элементы карточки...`);
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Card Node ID: ${cleanNodeId}\n`);

    const result = await getFigmaFileNodes(fileKey, cleanNodeId);
    
    if (!result.nodes || !result.nodes[cleanNodeId]) {
      console.error('❌ Нода не найдена');
      process.exit(1);
    }

    const cardNode = result.nodes[cleanNodeId].document;
    const elements = extractRelativePositions(cardNode);
    
    console.log(JSON.stringify({
      card: {
        id: cardNode.id,
        name: cardNode.name,
        width: cardNode.absoluteBoundingBox?.width,
        height: cardNode.absoluteBoundingBox?.height,
      },
      elements: elements,
    }, null, 2));

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
