#!/usr/bin/env node

/**
 * Find specific Figma node and its children
 * Находит конкретный узел по ID и показывает его структуру
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

function printNode(node, depth = 0, path = '') {
  const indent = '  '.repeat(depth);
  const currentPath = path ? `${path} > ${node.name}` : node.name;
  
  console.log(`${indent}${node.name} (${node.type})`);
  console.log(`${indent}  ID: ${node.id}`);
  
  if (node.children && node.children.length > 0) {
    console.log(`${indent}  Children: ${node.children.length}`);
    node.children.forEach(child => {
      printNode(child, depth + 1, currentPath);
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Использование:
  node scripts/find-figma-node.js <file_key> <node_id>

Примеры:
  node scripts/find-figma-node.js oR5AwDiD7ek4IxUOgyZCbU 277-420
    `);
    process.exit(1);
  }

  let [fileKey, nodeId] = args;
  
  // Конвертируем формат node-id из URL (277-420) в формат API (277:420)
  nodeId = nodeId.replace(/-/g, ':');

  try {
    console.log(`📥 Получаю информацию о ноде...`);
    console.log(`   File Key: ${fileKey}`);
    console.log(`   Node ID: ${nodeId}\n`);

    const result = await getFigmaFileNodes(fileKey, nodeId);
    
    if (!result.nodes || !result.nodes[nodeId]) {
      console.error('❌ Нода не найдена');
      console.log('Доступные ноды:', Object.keys(result.nodes || {}));
      process.exit(1);
    }

    const node = result.nodes[nodeId].document;
    
    console.log(`\n✅ Нода найдена:\n`);
    printNode(node);

    // Ищем иконки внутри
    console.log(`\n\n🔍 Поиск иконок внутри ноды...\n`);
    const icons = [];
    
    function findIconsRecursive(n, path = '') {
      const currentPath = path ? `${path} > ${n.name}` : n.name;
      
      if (n.type === 'COMPONENT' || n.type === 'INSTANCE') {
        if (n.name && (n.name.toLowerCase().includes('icon') || 
                       n.name.toLowerCase().includes('tabler'))) {
          icons.push({
            id: n.id,
            name: n.name,
            type: n.type,
            path: currentPath,
          });
        }
      }
      
      if (n.children) {
        n.children.forEach(child => {
          findIconsRecursive(child, currentPath);
        });
      }
    }
    
    findIconsRecursive(node);
    
    if (icons.length > 0) {
      console.log(`Найдено иконок: ${icons.length}\n`);
      icons.forEach((icon, i) => {
        console.log(`${i + 1}. ${icon.name}`);
        console.log(`   ID: ${icon.id}`);
        console.log(`   Путь: ${icon.path}\n`);
      });
    } else {
      console.log('⚠️  Иконки не найдены в этой ноде');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
