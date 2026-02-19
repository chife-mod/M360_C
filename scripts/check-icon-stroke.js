#!/usr/bin/env node

/**
 * Check icon stroke width from Figma
 */

const https = require('https');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'figd_MyCJzbt6ae1JwF7YvounKb5Oi0npZD0h4xYT5PO_';

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

function findVectorNodes(node, vectors = []) {
  if (!node) return vectors;
  
  if (node.type === 'VECTOR' && node.strokes && node.strokes.length > 0) {
    vectors.push({
      id: node.id,
      name: node.name,
      strokeWidth: node.strokeWeight,
      stroke: node.strokes[0],
    });
  }
  
  if (node.children) {
    node.children.forEach(child => findVectorNodes(child, vectors));
  }
  
  return vectors;
}

async function main() {
  const fileKey = 'oR5AwDiD7ek4IxUOgyZCbU';
  const iconInstanceId = '100:383'; // Brands icon instance
  
  try {
    console.log(`📥 Проверяю толщину stroke иконки...`);
    const result = await getFigmaFileNodes(fileKey, iconInstanceId);
    const node = result.nodes[iconInstanceId]?.document;
    
    if (node) {
      const vectors = findVectorNodes(node);
      console.log('\n📊 Найденные VECTOR элементы:');
      vectors.forEach(v => {
        console.log(`  ${v.name}:`);
        console.log(`    strokeWidth: ${v.strokeWidth}`);
        console.log(`    stroke: ${JSON.stringify(v.stroke)}`);
      });
    } else {
      console.error('❌ Иконка не найдена');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

main();
