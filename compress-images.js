import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'images');

// Target settings
const PHOTO_MAX_WIDTH = 1200;  // px
const PHOTO_QUALITY = 75;      // JPEG quality (0-100)
const MAP_MAX_WIDTH = 1600;    // maps need a bit more detail
const MAP_QUALITY = 80;

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const isMap = path.basename(filePath).toLowerCase().startsWith('map');
  const maxWidth = isMap ? MAP_MAX_WIDTH : PHOTO_MAX_WIDTH;
  const quality = isMap ? MAP_QUALITY : PHOTO_QUALITY;

  const statBefore = fs.statSync(filePath).size;

  const image = sharp(filePath);
  const meta = await image.metadata();

  // Only resize if wider than the target
  const resized = meta.width > maxWidth ? image.resize(maxWidth) : image;

  // Always output as JPEG for photos/maps
  const outPath = filePath.replace(/\.(jpeg|png)$/i, '.jpg');
  await resized.jpeg({ quality, mozjpeg: true }).toFile(outPath + '.tmp');

  // Replace original (handle case where output path differs from input)
  fs.renameSync(outPath + '.tmp', outPath);
  if (outPath !== filePath) fs.unlinkSync(filePath);

  const statAfter = fs.statSync(outPath).size;
  const saved = (((statBefore - statAfter) / statBefore) * 100).toFixed(0);
  const kb = (n) => (n / 1024).toFixed(0) + ' KB';
  console.log(`  ${path.relative(IMAGES_DIR, outPath).padEnd(55)} ${kb(statBefore).padStart(8)} → ${kb(statAfter).padStart(7)}  (${saved}% smaller)`);
}

async function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else await compressFile(full);
  }
}

console.log('Compressing images...\n');
await walk(IMAGES_DIR);
console.log('\nDone.');
