# Figma Assets Exporter

Скрипты для экспорта PNG и SVG из Figma в папку `public/assets` проекта.

## Настройка

Токен Figma уже настроен в скриптах. Если нужно изменить, установите переменную окружения:

```bash
export FIGMA_TOKEN="your_token_here"
```

## Использование

### Экспорт одного файла

```bash
# PNG
npm run figma:export oR5AwDiD7ek4IxUOgyZCbU 277-420 png icon-name

# SVG
npm run figma:export oR5AwDiD7ek4IxUOgyZCbU 277-420 svg icon-name

# Или напрямую
node scripts/export-figma-assets.js oR5AwDiD7ek4IxUOgyZCbU 277-420 svg brands-icon
```

### Пакетный экспорт иконок

```bash
npm run figma:icons oR5AwDiD7ek4IxUOgyZCbU '{"brands":"277-420","media":"277-421","pricing":"277-422"}'
```

## Параметры

- `file_key` - ключ файла Figma (из URL: `figma.com/file/{file_key}/...`)
- `node_id` - ID ноды (из URL: `node-id={node_id}`)
- `format` - формат: `png`, `svg`, `jpg`, `pdf` (по умолчанию: `png`)
- `name` - имя файла без расширения (по умолчанию: `figma-{node_id}`)

## Примеры

### Из URL Figma

URL: `https://www.figma.com/design/oR5AwDiD7ek4IxUOgyZCbU/Market-360-Design?node-id=277-420`

```bash
# file_key = oR5AwDiD7ek4IxUOgyZCbU
# node_id = 277-420

npm run figma:export oR5AwDiD7ek4IxUOgyZCbU 277-420 svg pricing-icon
```

### Экспорт нескольких иконок

```bash
npm run figma:icons oR5AwDiD7ek4IxUOgyZCbU '{
  "brands": "277-420",
  "media": "277-421", 
  "pricing": "277-422",
  "categories": "277-423"
}'
```

## Результат

- SVG иконки → `public/assets/icons/{name}.svg`
- PNG/JPG изображения → `public/assets/images/{name}.{ext}`

## Примечания

- Для SVG используется масштаб 1x (векторный формат)
- Для PNG используется масштаб 2x по умолчанию (retina-ready)
- Все файлы сохраняются в соответствующие папки автоматически
