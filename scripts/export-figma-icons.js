#!/usr/bin/env node

/**
 * Batch Figma Icons Exporter
 * Экспортирует несколько иконок из Figma за раз
 * 
 * Использование:
 * node scripts/export-figma-icons.js <file_key> <node_ids_json>
 * 
 * Пример:
 * node scripts/export-figma-icons.js oR5AwDiD7ek4IxUOgyZCbU '{"brands":"123-456","media":"123-457"}'
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const exportScript = path.join(__dirname, 'export-figma-assets.js');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Использование:
  node scripts/export-figma-icons.js <file_key> <node_ids_json>

Пример:
  node scripts/export-figma-icons.js oR5AwDiD7ek4IxUOgyZCbU '{"brands":"277-420","media":"277-421","pricing":"277-422"}'
    `);
    process.exit(1);
  }

  const [fileKey, nodeIdsJson] = args;
  const nodeIds = JSON.parse(nodeIdsJson);

  console.log(`📦 Экспортирую ${Object.keys(nodeIds).length} иконок...\n`);

  for (const [name, nodeId] of Object.entries(nodeIds)) {
    try {
      console.log(`📥 ${name}...`);
      execSync(`node "${exportScript}" ${fileKey} ${nodeId} svg ${name}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      });
      console.log(`✅ ${name} готово\n`);
    } catch (error) {
      console.error(`❌ Ошибка при экспорте ${name}:`, error.message);
    }
  }

  console.log('🎉 Все иконки экспортированы!');
}

main();
